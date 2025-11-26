import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiskScore } from "@/components/risk-score";
import { truncateAddress } from "@/lib/wallet";
import {
  Shield,
  AlertTriangle,
  FileCode,
  Brain,
  Database,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TransactionAnalysis } from "@shared/schema";

interface TransactionModalProps {
  transaction: TransactionAnalysis | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onBlock?: (id: string) => void;
}

export function TransactionModal({
  transaction,
  open,
  onClose,
  onApprove,
  onBlock,
}: TransactionModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1 hover:bg-muted rounded transition-colors"
      data-testid={`button-copy-${field}`}
    >
      {copiedField === field ? (
        <Check className="h-3 w-3 text-safe" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl">Transaction Analysis</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <span>{truncateAddress(transaction.hash)}</span>
                <CopyButton text={transaction.hash} field="hash" />
                <a
                  href={`https://polygonscan.com/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <RiskScore
              score={transaction.riskScore}
              level={transaction.riskLevel}
              size="md"
            />
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 min-h-0">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent px-0">
            <TabsTrigger
              value="overview"
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              data-testid="tab-overview"
            >
              <Shield className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="contract"
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              data-testid="tab-contract"
            >
              <FileCode className="h-4 w-4" />
              Contract Analysis
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              data-testid="tab-ai"
            >
              <Brain className="h-4 w-4" />
              AI Reasoning
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              data-testid="tab-data"
            >
              <Database className="h-4 w-4" />
              Transaction Data
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 pt-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">From</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{truncateAddress(transaction.from)}</span>
                    <CopyButton text={transaction.from} field="from" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">To</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{truncateAddress(transaction.to)}</span>
                    <CopyButton text={transaction.to} field="to" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <p className="font-semibold">
                    {transaction.value} {transaction.tokenSymbol}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      transaction.status === "blocked"
                        ? "destructive"
                        : transaction.status === "approved"
                        ? "default"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>

              {transaction.threats.length > 0 && (
                <div className="p-4 rounded-lg bg-high-risk/10 border border-high-risk/30">
                  <div className="flex items-center gap-2 text-high-risk font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Threats Detected
                  </div>
                  <ul className="space-y-1">
                    {transaction.threats.map((threat, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-high-risk mt-1">•</span>
                        {threat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transaction.phishingDetected && (
                <div className="p-4 rounded-lg bg-high-risk/10 border border-high-risk/30">
                  <div className="flex items-center gap-2 text-high-risk font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Phishing Attack Detected
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This transaction appears to be interacting with a known phishing contract or
                    domain.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="contract" className="mt-0 space-y-4">
              {transaction.contractAnalysis ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Contract Type</span>
                      <Badge variant="secondary">
                        {transaction.contractAnalysis.isContract ? "Smart Contract" : "EOA"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Verification Status</span>
                      <Badge
                        variant={
                          transaction.contractAnalysis.isVerified ? "default" : "secondary"
                        }
                      >
                        {transaction.contractAnalysis.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Risk Patterns Detected</span>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          transaction.contractAnalysis.hasHoneypotPatterns
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {transaction.contractAnalysis.hasHoneypotPatterns
                          ? "Honeypot Pattern Found"
                          : "No Honeypot Pattern"}
                      </Badge>
                      <Badge
                        variant={
                          transaction.contractAnalysis.hasDrainerPatterns
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {transaction.contractAnalysis.hasDrainerPatterns
                          ? "Drainer Pattern Found"
                          : "No Drainer Pattern"}
                      </Badge>
                      <Badge
                        variant={
                          transaction.contractAnalysis.hasRugPullPatterns
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {transaction.contractAnalysis.hasRugPullPatterns
                          ? "Rug Pull Pattern Found"
                          : "No Rug Pull Pattern"}
                      </Badge>
                    </div>
                  </div>

                  {transaction.contractAnalysis.suspiciousFunctions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-high-risk">
                        Suspicious Functions
                      </span>
                      <div className="p-3 bg-muted rounded-lg">
                        <code className="text-xs font-mono">
                          {transaction.contractAnalysis.suspiciousFunctions.join(", ")}
                        </code>
                      </div>
                    </div>
                  )}

                  {transaction.contractAnalysis.riskIndicators.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Risk Indicators</span>
                      <ul className="space-y-1">
                        {transaction.contractAnalysis.riskIndicators.map((indicator, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <AlertTriangle className="h-3 w-3 mt-1 text-medium-risk shrink-0" />
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No contract analysis available for this transaction.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI Security Analysis</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {transaction.aiReasoning}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <RiskScore
                  score={transaction.riskScore}
                  level={transaction.riskLevel}
                  size="lg"
                />
                <div className="space-y-1">
                  <p className="font-medium">
                    Risk Assessment:{" "}
                    <span
                      className={cn(
                        transaction.riskLevel === "safe" && "text-safe",
                        transaction.riskLevel === "medium" && "text-medium-risk",
                        transaction.riskLevel === "high" && "text-high-risk"
                      )}
                    >
                      {transaction.riskLevel === "safe"
                        ? "Safe to Proceed"
                        : transaction.riskLevel === "medium"
                        ? "Exercise Caution"
                        : "High Risk - Not Recommended"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on AI analysis of transaction patterns, contract code, and historical
                    data.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Transaction Hash</span>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <code className="text-xs font-mono break-all flex-1">{transaction.hash}</code>
                    <CopyButton text={transaction.hash} field="hash-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Gas Price</span>
                    <p className="font-mono text-sm">{transaction.gasPrice} Gwei</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Gas Limit</span>
                    <p className="font-mono text-sm">{transaction.gasLimit}</p>
                  </div>
                </div>

                {transaction.data && transaction.data !== "0x" && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Input Data</span>
                    <div className="p-2 bg-muted rounded-lg max-h-32 overflow-auto">
                      <code className="text-xs font-mono break-all">{transaction.data}</code>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {transaction.status === "pending" && (
          <DialogFooter className="border-t pt-4 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onBlock?.(transaction.id);
                onClose();
              }}
              className="text-high-risk hover:text-high-risk hover:bg-high-risk/10"
              data-testid="modal-button-block"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Block & Report
            </Button>
            <Button
              onClick={() => {
                onApprove?.(transaction.id);
                onClose();
              }}
              className="bg-safe hover:bg-safe/90"
              data-testid="modal-button-approve"
            >
              <Shield className="mr-2 h-4 w-4" />
              Approve Transaction
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
