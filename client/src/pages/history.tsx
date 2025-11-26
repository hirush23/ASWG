import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { History, Search, Filter, Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionCard } from "@/components/transaction-card";
import { TransactionModal } from "@/components/transaction-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TransactionAnalysis, RiskLevel } from "@shared/schema";

export default function HistoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionAnalysis | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: transactions, isLoading } = useQuery<TransactionAnalysis[]>({
    queryKey: ["/api/transactions"],
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/transactions/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
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
      toast({
        title: "Transaction Blocked",
        description: "The transaction has been blocked and reported.",
        variant: "destructive",
      });
    },
  });

  const filteredTransactions = transactions?.filter((t) => {
    const matchesSearch =
      searchQuery === "" ||
      t.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter === "all" || t.riskLevel === riskFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const handleViewDetails = (transaction: TransactionAnalysis) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const getStatusCounts = () => {
    if (!transactions) return { pending: 0, approved: 0, blocked: 0, completed: 0 };
    return {
      pending: transactions.filter((t) => t.status === "pending").length,
      approved: transactions.filter((t) => t.status === "approved").length,
      blocked: transactions.filter((t) => t.status === "blocked").length,
      completed: transactions.filter((t) => t.status === "completed").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <History className="h-6 w-6" />
          Transaction History
        </h1>
        <p className="text-muted-foreground">View and manage all your analyzed transactions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-visible">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-medium-risk/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-medium-risk" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{statusCounts.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-safe/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-safe" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{statusCounts.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-high-risk/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-high-risk" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{statusCounts.blocked}</p>
              <p className="text-xs text-muted-foreground">Blocked</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{statusCounts.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | "all")}>
            <SelectTrigger className="w-[140px]" data-testid="select-risk-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
      ) : filteredTransactions && filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onApprove={(id) => approveMutation.mutate(id)}
              onBlock={(id) => blockMutation.mutate(id)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-1">No transactions found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || riskFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "When you make transactions, they'll appear here."}
            </p>
          </CardContent>
        </Card>
      )}

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
