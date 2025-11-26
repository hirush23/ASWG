type HandlerEvent = {
  path: string;
  httpMethod: string;
  body: string | null;
};

type HandlerContext = Record<string, unknown>;

type HandlerResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type Handler = (event: HandlerEvent, context: HandlerContext) => Promise<HandlerResponse>;

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

interface TransactionAnalysis {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
  gasPrice: string;
  gasLimit: string;
  data: string;
  riskScore: number;
  riskLevel: string;
  aiReasoning: string;
  threats: string[];
  contractAnalysis?: object;
  phishingDetected: boolean;
  timestamp: number;
  status: string;
  networkId: number;
}

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  transactionId?: string;
}

interface WalletStats {
  totalTransactions: number;
  threatsBlocked: number;
  avgRiskScore: number;
  activeProtections: number;
  transactionsChange: string;
  threatsChange: string;
}

const transactions: TransactionAnalysis[] = [
  {
    id: "1",
    hash: "0xSCAM...0001",
    from: "0x1234...5678",
    to: "0xSCAM...0001",
    value: "500",
    tokenSymbol: "MATIC",
    gasPrice: "30",
    gasLimit: "21000",
    data: "0x",
    riskScore: 85,
    riskLevel: "high",
    aiReasoning: "This transaction targets a known scam contract. The destination address has been flagged for draining user funds through fake token approvals.",
    threats: ["Known scam address", "Drainer pattern detected", "No verified source code"],
    phishingDetected: true,
    timestamp: Date.now() - 3600000,
    status: "blocked",
    networkId: 137,
  },
  {
    id: "2",
    hash: "0xA0b8...eB48",
    from: "0x1234...5678",
    to: "0xA0b8...eB48",
    value: "100",
    tokenSymbol: "USDC",
    gasPrice: "35",
    gasLimit: "65000",
    data: "0xa9059cbb",
    riskScore: 45,
    riskLevel: "medium",
    aiReasoning: "This appears to be a USDC transfer to a relatively new address. The contract is verified, but the receiving address was created recently and has limited transaction history. Exercise caution.",
    threats: ["New destination address", "Limited history"],
    phishingDetected: false,
    timestamp: Date.now() - 900000,
    status: "pending",
    networkId: 137,
  },
  {
    id: "3",
    hash: "0x7890...SAFE",
    from: "0x1234...5678",
    to: "0x7890...SAFE",
    value: "50",
    tokenSymbol: "MATIC",
    gasPrice: "25",
    gasLimit: "21000",
    data: "0x",
    riskScore: 12,
    riskLevel: "safe",
    aiReasoning: "Standard MATIC transfer to a well-known and verified address. This destination has extensive positive transaction history and is considered safe.",
    threats: [],
    phishingDetected: false,
    timestamp: Date.now() - 7200000,
    status: "approved",
    networkId: 137,
  },
  {
    id: "4",
    hash: "0xDEFI...0002",
    from: "0x1234...5678",
    to: "0xDEFI...0002",
    value: "1000",
    tokenSymbol: "MATIC",
    gasPrice: "40",
    gasLimit: "150000",
    data: "0x095ea7b3",
    riskScore: 55,
    riskLevel: "medium",
    aiReasoning: "Token approval request for a DeFi protocol. The contract is verified but this operation grants spending rights. Review the approval amount carefully.",
    threats: ["Unlimited approval requested"],
    phishingDetected: false,
    timestamp: Date.now() - 10800000,
    status: "approved",
    networkId: 137,
  },
  {
    id: "5",
    hash: "0xNFT0...0003",
    from: "0x1234...5678",
    to: "0xNFT0...0003",
    value: "0.5",
    tokenSymbol: "MATIC",
    gasPrice: "50",
    gasLimit: "200000",
    data: "0x42842e0e",
    riskScore: 8,
    riskLevel: "safe",
    aiReasoning: "NFT transfer on a verified marketplace contract. The transaction follows standard ERC-721 patterns and the destination is a known legitimate marketplace.",
    threats: [],
    phishingDetected: false,
    timestamp: Date.now() - 14400000,
    status: "approved",
    networkId: 137,
  },
];

const alerts: Alert[] = [
  {
    id: "1",
    type: "threat",
    title: "High-Risk Transaction Blocked",
    message: "A transaction with risk score 85 was automatically blocked.",
    timestamp: Date.now() - 3600000,
    read: false,
    transactionId: "1",
  },
  {
    id: "2",
    type: "warning",
    title: "Medium Risk Transaction Pending",
    message: "A transaction requires your review before approval.",
    timestamp: Date.now() - 900000,
    read: false,
    transactionId: "2",
  },
  {
    id: "3",
    type: "info",
    title: "Protection Updated",
    message: "Your security settings have been updated successfully.",
    timestamp: Date.now() - 86400000,
    read: true,
  },
];

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function sanitizeHexData(data: string): string {
  if (!data || data === "0x") return "0x";
  if (!/^0x[a-fA-F0-9]*$/.test(data)) return "0x";
  return data;
}

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

function getRiskAnalysis(contractAnalysis: ReturnType<typeof analyzeContractBytecode>): { 
  riskScore: number; 
  reasoning: string; 
  threats: string[] 
} {
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
    reasoning: "Risk score calculated based on pattern matching of transaction data and contract bytecode analysis.",
    threats,
  };
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const path = event.path.replace("/.netlify/functions/api", "").replace("/api", "");
  const method = event.httpMethod;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    if (path === "/stats" && method === "GET") {
      const stats: WalletStats = {
        totalTransactions: transactions.length,
        threatsBlocked: transactions.filter(t => t.status === "blocked").length,
        avgRiskScore: Math.round(transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length),
        activeProtections: 4,
        transactionsChange: "+12%",
        threatsChange: "+8%",
      };
      return { statusCode: 200, headers, body: JSON.stringify(stats) };
    }

    if (path === "/transactions" && method === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(transactions) };
    }

    if (path.match(/^\/transactions\/[^/]+$/) && method === "GET") {
      const id = path.split("/")[2];
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Transaction not found" }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify(transaction) };
    }

    if (path === "/transactions/analyze" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { from, to, value, data, gasPrice, gasLimit, networkId } = body;

      if (!from || !isValidEthereumAddress(from)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid 'from' address format" }) };
      }
      if (!to || !isValidEthereumAddress(to)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid 'to' address format" }) };
      }

      const sanitizedData = sanitizeHexData(data || "0x");
      const contractAnalysis = analyzeContractBytecode(sanitizedData);
      const analysis = getRiskAnalysis(contractAnalysis);

      const riskLevel = analysis.riskScore >= 70 ? "high" : analysis.riskScore >= 40 ? "medium" : "safe";

      const newTransaction: TransactionAnalysis = {
        id: String(transactions.length + 1),
        hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
        from,
        to,
        value: value || "0",
        tokenSymbol: "MATIC",
        gasPrice: gasPrice || "30",
        gasLimit: gasLimit || "21000",
        data: sanitizedData,
        riskScore: analysis.riskScore,
        riskLevel,
        aiReasoning: analysis.reasoning,
        threats: analysis.threats,
        contractAnalysis: contractAnalysis || undefined,
        phishingDetected: false,
        timestamp: Date.now(),
        status: "pending",
        networkId: networkId || 137,
      };

      transactions.unshift(newTransaction);

      const recommendation = analysis.riskScore >= 70 ? "block" : analysis.riskScore >= 40 ? "review" : "approve";

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ analysis: newTransaction, recommendation }),
      };
    }

    if (path.match(/^\/transactions\/[^/]+\/approve$/) && method === "POST") {
      const id = path.split("/")[2];
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Transaction not found" }) };
      }
      transaction.status = "approved";
      return { statusCode: 200, headers, body: JSON.stringify(transaction) };
    }

    if (path.match(/^\/transactions\/[^/]+\/block$/) && method === "POST") {
      const id = path.split("/")[2];
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Transaction not found" }) };
      }
      transaction.status = "blocked";
      return { statusCode: 200, headers, body: JSON.stringify(transaction) };
    }

    if (path === "/phishing/check" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.url) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "URL is required" }) };
      }
      const result = checkPhishing(body.url);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (path === "/alerts" && method === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(alerts) };
    }

    if (path.match(/^\/alerts\/[^/]+\/read$/) && method === "POST") {
      const id = path.split("/")[2];
      const alert = alerts.find(a => a.id === id);
      if (!alert) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Alert not found" }) };
      }
      alert.read = true;
      return { statusCode: 200, headers, body: JSON.stringify(alert) };
    }

    if (path === "/alerts/read-all" && method === "POST") {
      alerts.forEach(a => a.read = true);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (path.match(/^\/alerts\/[^/]+$/) && method === "DELETE") {
      const id = path.split("/")[2];
      const index = alerts.findIndex(a => a.id === id);
      if (index === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Alert not found" }) };
      }
      alerts.splice(index, 1);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: "Not found" }) };
  } catch (error) {
    console.error("API Error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal server error" }) };
  }
};

export { handler };
