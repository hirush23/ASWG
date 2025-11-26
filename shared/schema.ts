import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type RiskLevel = "safe" | "medium" | "high";

export interface TransactionAnalysis {
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
  riskLevel: RiskLevel;
  aiReasoning: string;
  threats: string[];
  contractAnalysis?: ContractAnalysis;
  phishingDetected: boolean;
  timestamp: number;
  status: "pending" | "approved" | "blocked" | "completed";
  networkId: number;
}

export interface ContractAnalysis {
  isContract: boolean;
  bytecodeHash?: string;
  isVerified: boolean;
  hasHoneypotPatterns: boolean;
  hasDrainerPatterns: boolean;
  hasRugPullPatterns: boolean;
  suspiciousFunctions: string[];
  riskIndicators: string[];
}

export interface WalletStats {
  totalTransactionsScanned: number;
  threatsBlocked: number;
  averageRiskScore: number;
  activeProtections: number;
}

export interface AnalyzeTransactionRequest {
  from: string;
  to: string;
  value: string;
  data: string;
  gasPrice?: string;
  gasLimit?: string;
  networkId?: number;
}

export interface AnalyzeTransactionResponse {
  analysis: TransactionAnalysis;
  recommendation: "approve" | "review" | "block";
}

export interface PhishingCheckRequest {
  url: string;
}

export interface PhishingCheckResponse {
  isPhishing: boolean;
  confidence: number;
  reason: string;
}

export const analyzeTransactionRequestSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  value: z.string(),
  data: z.string().optional().default("0x"),
  gasPrice: z.string().optional(),
  gasLimit: z.string().optional(),
  networkId: z.number().optional().default(137),
});

export const phishingCheckRequestSchema = z.object({
  url: z.string().url(),
});

export type InsertAnalyzeTransactionRequest = z.infer<typeof analyzeTransactionRequestSchema>;
export type InsertPhishingCheckRequest = z.infer<typeof phishingCheckRequestSchema>;
