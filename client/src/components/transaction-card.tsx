import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownLeft,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskScore, RiskBadge } from "@/components/risk-score";
import { truncateAddress } from "@/lib/wallet";
import { cn } from "@/lib/utils";
import type { TransactionAnalysis } from "@shared/schema";

interface TransactionCardProps {
  transaction: TransactionAnalysis;
  onApprove?: (id: string) => void;
  onBlock?: (id: string) => void;
  onViewDetails?: (transaction: TransactionAnalysis) => void;
}

export function TransactionCard({
  transaction,
  onApprove,
  onBlock,
  onViewDetails,
}: TransactionCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(transaction.to);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTransactionIcon = () => {
    if (transaction.data && transaction.data !== "0x") {
      return <FileCode className="h-5 w-5" />;
    }
    return transaction.value.startsWith("-") ? (
      <ArrowUpRight className="h-5 w-5" />
    ) : (
      <ArrowDownLeft className="h-5 w-5" />
    );
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "approved":
        return <Shield className="h-4 w-4 text-safe" />;
      case "blocked":
        return <XCircle className="h-4 w-4 text-high-risk" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-medium-risk animate-pulse" />;
      default:
        return <Check className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  return (
    <Card
      className={cn(
        "relative overflow-visible transition-colors",
        transaction.riskLevel === "high" && "border-high-risk/50",
        transaction.riskLevel === "medium" && "border-medium-risk/50"
      )}
      data-testid={`card-transaction-${transaction.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
              transaction.riskLevel === "safe" && "bg-safe/10 text-safe",
              transaction.riskLevel === "medium" && "bg-medium-risk/10 text-medium-risk",
              transaction.riskLevel === "high" && "bg-high-risk/10 text-high-risk"
            )}
          >
            {getTransactionIcon()}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">To:</span>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1 font-mono text-sm hover:text-primary transition-colors"
                    data-testid="button-copy-address"
                  >
                    {truncateAddress(transaction.to)}
                    {copied ? (
                      <Check className="h-3 w-3 text-safe" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {formatValue(transaction.value)} {transaction.tokenSymbol}
                  </span>
                  {transaction.phishingDetected && (
                    <Badge variant="destructive" className="text-xs">
                      Phishing Detected
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <RiskScore
                  score={transaction.riskScore}
                  level={transaction.riskLevel}
                  size="sm"
                  showLabel={false}
                />
                <RiskBadge level={transaction.riskLevel} />
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{transaction.aiReasoning}</p>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-expand-analysis"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" /> Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" /> View full analysis
                </>
              )}
            </button>

            {expanded && (
              <div className="pt-2 space-y-3 border-t">
                {transaction.threats.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-high-risk">Threats Detected:</span>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {transaction.threats.map((threat, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 text-high-risk shrink-0" />
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {transaction.contractAnalysis && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium">Contract Analysis:</span>
                    <div className="flex flex-wrap gap-1">
                      {transaction.contractAnalysis.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      {transaction.contractAnalysis.hasHoneypotPatterns && (
                        <Badge variant="destructive" className="text-xs">
                          Honeypot Pattern
                        </Badge>
                      )}
                      {transaction.contractAnalysis.hasDrainerPatterns && (
                        <Badge variant="destructive" className="text-xs">
                          Drainer Pattern
                        </Badge>
                      )}
                      {transaction.contractAnalysis.hasRugPullPatterns && (
                        <Badge variant="destructive" className="text-xs">
                          Rug Pull Pattern
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground font-mono">
                  Hash: {transaction.hash}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {getStatusIcon()}
                <span className="capitalize">{transaction.status}</span>
                <span>•</span>
                <span>{formatDistanceToNow(transaction.timestamp, { addSuffix: true })}</span>
              </div>

              <div className="flex items-center gap-2">
                {transaction.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onBlock?.(transaction.id)}
                      className="text-high-risk hover:text-high-risk hover:bg-high-risk/10"
                      data-testid="button-block-transaction"
                    >
                      Block
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove?.(transaction.id)}
                      className="bg-safe hover:bg-safe/90 text-white"
                      data-testid="button-approve-transaction"
                    >
                      Approve
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails?.(transaction)}
                  data-testid="button-view-details"
                >
                  Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
