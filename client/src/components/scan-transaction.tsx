import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Scan, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { RiskScore, RiskBadge } from "@/components/risk-score";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AnalyzeTransactionResponse } from "@shared/schema";

export function ScanTransactionButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<AnalyzeTransactionResponse | null>(null);
  const [form, setForm] = useState({
    from: "",
    to: "",
    value: "",
    data: "",
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: typeof form): Promise<AnalyzeTransactionResponse> => {
      const response = await apiRequest("POST", "/api/transactions/analyze", data);
      return response.json();
    },
    onSuccess: (response) => {
      setResult(response);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    analyzeMutation.mutate(form);
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setForm({ from: "", to: "", value: "", data: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-scan-transaction">
          <Scan className="h-4 w-4" />
          Scan Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Analyze Transaction
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">From Address</Label>
              <Input
                id="from"
                placeholder="0x..."
                value={form.from}
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                required
                data-testid="input-from-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To Address</Label>
              <Input
                id="to"
                placeholder="0x..."
                value={form.to}
                onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
                required
                data-testid="input-to-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value (MATIC)</Label>
              <Input
                id="value"
                type="text"
                placeholder="0.0"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                required
                data-testid="input-value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Contract Data (optional)</Label>
              <Textarea
                id="data"
                placeholder="0x..."
                value={form.data}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                className="font-mono text-sm"
                rows={3}
                data-testid="input-contract-data"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={analyzeMutation.isPending} className="gap-2">
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Card className="overflow-visible">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <RiskScore
                    score={result.analysis.riskScore}
                    level={result.analysis.riskLevel}
                    size="lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <RiskBadge level={result.analysis.riskLevel} />
                      <span className="text-sm text-muted-foreground">
                        Recommendation:{" "}
                        <span className="font-medium capitalize">{result.recommendation}</span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.analysis.aiReasoning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.analysis.threats.length > 0 && (
              <Card className="border-high-risk/30 bg-high-risk/5 overflow-visible">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-high-risk font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Threats Detected
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.analysis.threats.map((threat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-high-risk mt-0.5">•</span>
                        {threat}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  setForm({ from: "", to: "", value: "", data: "" });
                }}
              >
                Scan Another
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
