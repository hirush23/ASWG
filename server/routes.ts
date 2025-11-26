import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeTransactionRequestSchema, phishingCheckRequestSchema } from "@shared/schema";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function sanitizeHexData(data: string): string {
  if (!data || data === "0x") return "0x";
  if (!/^0x[a-fA-F0-9]*$/.test(data)) return "0x";
  return data;
}

const KNOWN_PHISHING_DOMAINS = [
  "fake-uniswap.com",
  "metamask-secure.io",
  "polygon-airdrop.xyz",
  "opensea-claim.com",
  "uniswap-rewards.net",
  "free-nft-mint.io",
  "pancakeswap-airdrop.com",
];

const SUSPICIOUS_PATTERNS = {
  honeypot: ["onlyOwner", "blacklist", "addToBlacklist", "_hidden", "pause"],
  drainer: ["approve", "increaseAllowance", "transferFrom", "setApprovalForAll"],
  rugPull: ["mint", "setTaxFee", "excludeFromFee", "renounceOwnership"],
};

function analyzeContractBytecode(data: string) {
  const isContract = data && data !== "0x" && data.length > 10;

  if (!isContract) {
    return null;
  }

  const hasHoneypotPatterns = SUSPICIOUS_PATTERNS.honeypot.some((pattern) =>
    data.toLowerCase().includes(pattern.toLowerCase())
  );
  const hasDrainerPatterns = SUSPICIOUS_PATTERNS.drainer.some((pattern) =>
    data.toLowerCase().includes(pattern.toLowerCase())
  );
  const hasRugPullPatterns = SUSPICIOUS_PATTERNS.rugPull.some((pattern) =>
    data.toLowerCase().includes(pattern.toLowerCase())
  );

  const suspiciousFunctions: string[] = [];
  const allPatterns = [
    ...SUSPICIOUS_PATTERNS.honeypot,
    ...SUSPICIOUS_PATTERNS.drainer,
    ...SUSPICIOUS_PATTERNS.rugPull,
  ];
  allPatterns.forEach((pattern) => {
    if (data.toLowerCase().includes(pattern.toLowerCase())) {
      suspiciousFunctions.push(pattern);
    }
  });

  const riskIndicators: string[] = [];
  if (hasHoneypotPatterns) riskIndicators.push("Contains potential honeypot patterns");
  if (hasDrainerPatterns) riskIndicators.push("Contains approval/transfer patterns");
  if (hasRugPullPatterns) riskIndicators.push("Contains potential rug pull patterns");
  if (data.length > 10000) riskIndicators.push("Large contract size - complex logic");

  return {
    isContract: true,
    bytecodeHash: `0x${data.slice(2, 10)}...`,
    isVerified: false,
    hasHoneypotPatterns,
    hasDrainerPatterns,
    hasRugPullPatterns,
    suspiciousFunctions: Array.from(new Set(suspiciousFunctions)),
    riskIndicators,
  };
}

function checkPhishing(url: string): { isPhishing: boolean; confidence: number; reason: string } {
  const lowerUrl = url.toLowerCase();

  for (const domain of KNOWN_PHISHING_DOMAINS) {
    if (lowerUrl.includes(domain)) {
      return {
        isPhishing: true,
        confidence: 0.95,
        reason: `Domain "${domain}" is on the known phishing blacklist.`,
      };
    }
  }

  const suspiciousKeywords = ["free", "airdrop", "claim", "reward", "secure", "official"];
  const matchedKeywords = suspiciousKeywords.filter((kw) => lowerUrl.includes(kw));

  if (matchedKeywords.length >= 2) {
    return {
      isPhishing: true,
      confidence: 0.7,
      reason: `URL contains multiple suspicious keywords: ${matchedKeywords.join(", ")}`,
    };
  }

  if (matchedKeywords.length === 1) {
    return {
      isPhishing: false,
      confidence: 0.4,
      reason: `URL contains potentially suspicious keyword "${matchedKeywords[0]}" but is not definitively malicious.`,
    };
  }

  return {
    isPhishing: false,
    confidence: 0.9,
    reason: "No known phishing indicators detected.",
  };
}

function getFallbackRiskAnalysis(
  contractAnalysis: ReturnType<typeof analyzeContractBytecode>
): { riskScore: number; reasoning: string; threats: string[] } {
  let baseScore = 20;
  const threats: string[] = [];

  if (contractAnalysis) {
    if (contractAnalysis.hasHoneypotPatterns) {
      baseScore += 30;
      threats.push("Potential honeypot pattern detected");
    }
    if (contractAnalysis.hasDrainerPatterns) {
      baseScore += 25;
      threats.push("Token approval pattern detected - review carefully");
    }
    if (contractAnalysis.hasRugPullPatterns) {
      baseScore += 20;
      threats.push("Potential rug pull indicators found");
    }
    if (!contractAnalysis.isVerified) {
      baseScore += 10;
      threats.push("Contract source code not verified");
    }
  }

  return {
    riskScore: Math.min(100, baseScore),
    reasoning:
      "Risk score calculated based on pattern matching of transaction data and contract bytecode analysis. Enhanced analysis available when additional services are configured.",
    threats,
  };
}

async function getAIRiskAnalysis(
  transaction: {
    from: string;
    to: string;
    value: string;
    data: string;
  },
  contractAnalysis: ReturnType<typeof analyzeContractBytecode>
): Promise<{ riskScore: number; reasoning: string; threats: string[] }> {
  if (!openai) {
    console.log("OpenAI not configured, using fallback analysis");
    return getFallbackRiskAnalysis(contractAnalysis);
  }

  try {
    const prompt = `You are a Web3 security expert analyzing a blockchain transaction for potential risks.

Transaction Details:
- From: ${transaction.from}
- To: ${transaction.to}
- Value: ${transaction.value} MATIC
- Has Contract Data: ${transaction.data && transaction.data !== "0x" ? "Yes" : "No"}
${
  contractAnalysis
    ? `
Contract Analysis:
- Verified: ${contractAnalysis.isVerified}
- Honeypot Patterns: ${contractAnalysis.hasHoneypotPatterns}
- Drainer Patterns: ${contractAnalysis.hasDrainerPatterns}
- Rug Pull Patterns: ${contractAnalysis.hasRugPullPatterns}
- Suspicious Functions: ${contractAnalysis.suspiciousFunctions.join(", ") || "None"}
- Risk Indicators: ${contractAnalysis.riskIndicators.join(", ") || "None"}
`
    : ""
}

Analyze this transaction and provide:
1. A risk score from 0-100 (0 = safe, 100 = extremely dangerous)
2. A brief explanation of your assessment (2-3 sentences)
3. A list of specific threats detected (if any)

Respond in JSON format:
{
  "riskScore": number,
  "reasoning": "string",
  "threats": ["string"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return {
      riskScore: Math.max(0, Math.min(100, result.riskScore)),
      reasoning: result.reasoning,
      threats: result.threats || [],
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return getFallbackRiskAnalysis(contractAnalysis);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions/analyze", async (req, res) => {
    try {
      const parsed = analyzeTransactionRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const { from, to, value, data, gasPrice, gasLimit, networkId } = parsed.data;

      if (!isValidEthereumAddress(from)) {
        return res.status(400).json({ error: "Invalid 'from' address format" });
      }
      if (!isValidEthereumAddress(to)) {
        return res.status(400).json({ error: "Invalid 'to' address format" });
      }

      const sanitizedData = sanitizeHexData(data || "0x");
      const contractAnalysis = analyzeContractBytecode(sanitizedData);
      const phishingDetected = false;

      const aiResult = await getAIRiskAnalysis({ from, to, value, data: sanitizedData }, contractAnalysis);

      const riskLevel =
        aiResult.riskScore >= 70 ? "high" : aiResult.riskScore >= 40 ? "medium" : "safe";

      const transaction = await storage.createTransaction({
        hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
        from,
        to,
        value,
        tokenSymbol: "MATIC",
        gasPrice: gasPrice || "30",
        gasLimit: gasLimit || "21000",
        data: sanitizedData,
        riskScore: aiResult.riskScore,
        riskLevel,
        aiReasoning: aiResult.reasoning,
        threats: aiResult.threats,
        contractAnalysis: contractAnalysis || undefined,
        phishingDetected,
        timestamp: Date.now(),
        status: "pending",
        networkId: networkId || 137,
      });

      if (aiResult.riskScore >= 70) {
        await storage.createAlert({
          type: "threat",
          title: "High-Risk Transaction Detected",
          message: `A transaction with risk score ${aiResult.riskScore} requires your review.`,
          timestamp: Date.now(),
          read: false,
          transactionId: transaction.id,
        });
      }

      const recommendation =
        aiResult.riskScore >= 70 ? "block" : aiResult.riskScore >= 40 ? "review" : "approve";

      res.json({
        analysis: transaction,
        recommendation,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze transaction" });
    }
  });

  app.post("/api/transactions/:id/approve", async (req, res) => {
    try {
      const transaction = await storage.updateTransactionStatus(req.params.id, "approved");
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve transaction" });
    }
  });

  app.post("/api/transactions/:id/block", async (req, res) => {
    try {
      const transaction = await storage.updateTransactionStatus(req.params.id, "blocked");
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      await storage.createAlert({
        type: "threat",
        title: "Transaction Blocked",
        message: `Transaction ${transaction.hash.slice(0, 10)}... was blocked due to high risk.`,
        timestamp: Date.now(),
        read: false,
        transactionId: transaction.id,
      });

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to block transaction" });
    }
  });

  app.post("/api/phishing/check", async (req, res) => {
    try {
      const parsed = phishingCheckRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const result = checkPhishing(parsed.data.url);

      if (result.isPhishing) {
        await storage.createAlert({
          type: "phishing",
          title: "Phishing Domain Detected",
          message: `The domain "${new URL(parsed.data.url).hostname}" has been identified as a phishing attempt.`,
          timestamp: Date.now(),
          read: false,
        });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to check URL" });
    }
  });

  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts/:id/read", async (req, res) => {
    try {
      const alert = await storage.markAlertRead(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  app.post("/api/alerts/read-all", async (_req, res) => {
    try {
      await storage.markAllAlertsRead();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alerts as read" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const success = await storage.deleteAlert(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
