import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Shield, Ban, BarChart3, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricsCard } from "@/components/metrics-card";
import { TransactionCard } from "@/components/transaction-card";
import { TransactionModal } from "@/components/transaction-modal";
import { ScanTransactionButton } from "@/components/scan-transaction";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TransactionAnalysis, WalletStats } from "@shared/schema";

export default function DashboardPage() {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionAnalysis | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<WalletStats>({
    queryKey: ["/api/stats"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionAnalysis[]>({
    queryKey: ["/api/transactions"],
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/transactions/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Transaction Approved",
        description: "The transaction has been marked as safe.",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/transactions/${id}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Transaction Blocked",
        description: "The transaction has been blocked and reported.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (transaction: TransactionAnalysis) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const pendingTransactions = transactions?.filter((t) => t.status === "pending") || [];
  const recentTransactions = transactions?.filter((t) => t.status !== "pending").slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and protect your wallet transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
              queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            }}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <ScanTransactionButton />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricsCard
              title="Transactions Scanned"
              value={stats?.totalTransactionsScanned || 0}
              icon={<Shield className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <MetricsCard
              title="Threats Blocked"
              value={stats?.threatsBlocked || 0}
              icon={<Ban className="h-5 w-5" />}
              trend={{ value: 8, isPositive: false }}
            />
            <MetricsCard
              title="Average Risk Score"
              value={stats?.averageRiskScore || 0}
              icon={<BarChart3 className="h-5 w-5" />}
              format="score"
            />
            <MetricsCard
              title="Active Protections"
              value={stats?.activeProtections || 0}
              icon={<Zap className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {pendingTransactions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-medium-risk" />
            <h2 className="text-lg font-semibold">Pending Review</h2>
            <span className="text-sm text-muted-foreground">
              ({pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="space-y-4">
            {pendingTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onApprove={(id) => approveMutation.mutate(id)}
                onBlock={(id) => blockMutation.mutate(id)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        {transactionsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-14 w-14 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-1">No transactions yet</h3>
              <p className="text-sm text-muted-foreground">
                When you make transactions, they'll appear here for review.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <TransactionModal
        transaction={selectedTransaction}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApprove={(id) => approveMutation.mutate(id)}
        onBlock={(id) => blockMutation.mutate(id)}
      />
    </div>
  );
}
