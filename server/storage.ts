import { randomUUID } from "crypto";
import type {
  TransactionAnalysis,
  WalletStats,
  ContractAnalysis,
  RiskLevel,
} from "@shared/schema";

interface Alert {
  id: string;
  type: "threat" | "phishing" | "warning" | "info";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  transactionId?: string;
}

export interface IStorage {
  getTransactions(): Promise<TransactionAnalysis[]>;
  getTransaction(id: string): Promise<TransactionAnalysis | undefined>;
  createTransaction(transaction: Omit<TransactionAnalysis, "id">): Promise<TransactionAnalysis>;
  updateTransactionStatus(
    id: string,
    status: TransactionAnalysis["status"]
  ): Promise<TransactionAnalysis | undefined>;
  getStats(): Promise<WalletStats>;
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: Omit<Alert, "id">): Promise<Alert>;
  markAlertRead(id: string): Promise<Alert | undefined>;
  markAllAlertsRead(): Promise<void>;
  deleteAlert(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, TransactionAnalysis>;
  private alerts: Map<string, Alert>;

  constructor() {
    this.transactions = new Map();
    this.alerts = new Map();
    this.seedData();
  }

  private seedData() {
    const now = Date.now();

    const sampleTransactions: Omit<TransactionAnalysis, "id">[] = [
      {
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f1b3B7",
        to: "0x8ba1f109551bD432803012645Hac136c22C1234",
        value: "1.5",
        tokenSymbol: "MATIC",
        gasPrice: "30",
        gasLimit: "21000",
        data: "0x",
        riskScore: 15,
        riskLevel: "safe" as RiskLevel,
        aiReasoning:
          "This transaction appears to be a standard MATIC transfer to a well-known wallet address with a clean history. The receiving address has been active for over 2 years with no reported incidents.",
        threats: [],
        phishingDetected: false,
        timestamp: now - 1000 * 60 * 30,
        status: "completed",
        networkId: 137,
      },
      {
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f1b3B7",
        to: "0xDEADBEEF00000000000000000000000000000001",
        value: "0.5",
        tokenSymbol: "MATIC",
        gasPrice: "50",
        gasLimit: "150000",
        data: "0xa9059cbb000000000000000000000000dead",
        riskScore: 85,
        riskLevel: "high" as RiskLevel,
        aiReasoning:
          "HIGH RISK: This contract exhibits multiple drainer patterns. The approve function grants unlimited token access, and the contract code contains obfuscated transfer logic that could drain your wallet.",
        threats: [
          "Unlimited token approval detected",
          "Contract contains obfuscated transfer logic",
          "Similar contract reported as scam 47 times",
          "Contract owner can modify key functions",
        ],
        contractAnalysis: {
          isContract: true,
          bytecodeHash: "0xdead...",
          isVerified: false,
          hasHoneypotPatterns: false,
          hasDrainerPatterns: true,
          hasRugPullPatterns: false,
          suspiciousFunctions: ["approve", "transferFrom", "_hidden_drain"],
          riskIndicators: [
            "Unverified contract source code",
            "Owner has admin privileges",
            "No liquidity lock detected",
          ],
        },
        phishingDetected: false,
        timestamp: now - 1000 * 60 * 5,
        status: "pending",
        networkId: 137,
      },
      {
        hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f1b3B7",
        to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        value: "100",
        tokenSymbol: "USDC",
        gasPrice: "35",
        gasLimit: "65000",
        data: "0xa9059cbb",
        riskScore: 45,
        riskLevel: "medium" as RiskLevel,
        aiReasoning:
          "This appears to be a USDC transfer to a relatively new address. The contract is verified, but the receiving address was created recently and has limited transaction history. Exercise caution.",
        threats: ["Receiving address is only 3 days old", "Large value transfer to unknown address"],
        contractAnalysis: {
          isContract: true,
          bytecodeHash: "0xusdc...",
          isVerified: true,
          hasHoneypotPatterns: false,
          hasDrainerPatterns: false,
          hasRugPullPatterns: false,
          suspiciousFunctions: [],
          riskIndicators: ["Destination wallet has limited history"],
        },
        phishingDetected: false,
        timestamp: now - 1000 * 60 * 15,
        status: "pending",
        networkId: 137,
      },
      {
        hash: "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f1b3B7",
        to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        value: "2.0",
        tokenSymbol: "MATIC",
        gasPrice: "40",
        gasLimit: "250000",
        data: "0x7ff36ab5",
        riskScore: 22,
        riskLevel: "safe" as RiskLevel,
        aiReasoning:
          "This is a swap transaction through Uniswap V2 Router, a well-established and audited DEX protocol. The contract is verified and widely used across the ecosystem.",
        threats: [],
        contractAnalysis: {
          isContract: true,
          bytecodeHash: "0xuniswap...",
          isVerified: true,
          hasHoneypotPatterns: false,
          hasDrainerPatterns: false,
          hasRugPullPatterns: false,
          suspiciousFunctions: [],
          riskIndicators: [],
        },
        phishingDetected: false,
        timestamp: now - 1000 * 60 * 60 * 2,
        status: "approved",
        networkId: 137,
      },
      {
        hash: "0x0000111122223333444455556666777788889999aaaabbbbccccddddeeeeffff",
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f1b3B7",
        to: "0xSCAM0000000000000000000000000000000001",
        value: "50",
        tokenSymbol: "USDC",
        gasPrice: "100",
        gasLimit: "200000",
        data: "0x095ea7b3ffffffff",
        riskScore: 95,
        riskLevel: "high" as RiskLevel,
        aiReasoning:
          "CRITICAL: This transaction requests UNLIMITED token approval to a known scam contract. The domain associated with this contract has been flagged for phishing. DO NOT APPROVE.",
        threats: [
          "Unlimited approval requested",
          "Contract address flagged as scam",
          "Associated domain on phishing blacklist",
          "Multiple user reports of fund drainage",
        ],
        contractAnalysis: {
          isContract: true,
          bytecodeHash: "0xscam...",
          isVerified: false,
          hasHoneypotPatterns: true,
          hasDrainerPatterns: true,
          hasRugPullPatterns: true,
          suspiciousFunctions: ["approve", "drain", "emergencyWithdraw"],
          riskIndicators: [
            "Contract matches known scam pattern",
            "Owner controls 100% of supply",
            "No audit performed",
          ],
        },
        phishingDetected: true,
        timestamp: now - 1000 * 60 * 2,
        status: "blocked",
        networkId: 137,
      },
    ];

    sampleTransactions.forEach((tx) => {
      const id = randomUUID();
      this.transactions.set(id, { ...tx, id });
    });

    const sampleAlerts: Omit<Alert, "id">[] = [
      {
        type: "threat",
        title: "High-Risk Transaction Detected",
        message:
          "A transaction to a known drainer contract was intercepted and blocked automatically.",
        timestamp: now - 1000 * 60 * 2,
        read: false,
      },
      {
        type: "phishing",
        title: "Phishing Attempt Blocked",
        message:
          "We detected and blocked an attempt to connect to fake-uniswap.com, a known phishing domain.",
        timestamp: now - 1000 * 60 * 30,
        read: false,
      },
      {
        type: "warning",
        title: "Unusual Activity Detected",
        message:
          "Multiple rapid transactions detected from your wallet. If this wasn't you, please review your connected dApps.",
        timestamp: now - 1000 * 60 * 60,
        read: true,
      },
    ];

    sampleAlerts.forEach((alert) => {
      const id = randomUUID();
      this.alerts.set(id, { ...alert, id });
    });
  }

  async getTransactions(): Promise<TransactionAnalysis[]> {
    return Array.from(this.transactions.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async getTransaction(id: string): Promise<TransactionAnalysis | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(
    transaction: Omit<TransactionAnalysis, "id">
  ): Promise<TransactionAnalysis> {
    const id = randomUUID();
    const newTransaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionAnalysis["status"]
  ): Promise<TransactionAnalysis | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.status = status;
      this.transactions.set(id, transaction);
      return transaction;
    }
    return undefined;
  }

  async getStats(): Promise<WalletStats> {
    const transactions = Array.from(this.transactions.values());
    const blocked = transactions.filter((t) => t.status === "blocked").length;
    const avgRisk =
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length
        : 0;

    return {
      totalTransactionsScanned: transactions.length,
      threatsBlocked: blocked,
      averageRiskScore: Math.round(avgRisk * 10) / 10,
      activeProtections: 4,
    };
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: Omit<Alert, "id">): Promise<Alert> {
    const id = randomUUID();
    const newAlert = { ...alert, id };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async markAlertRead(id: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.read = true;
      this.alerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  async markAllAlertsRead(): Promise<void> {
    this.alerts.forEach((alert) => {
      alert.read = true;
    });
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.alerts.delete(id);
  }
}

export const storage = new MemStorage();
