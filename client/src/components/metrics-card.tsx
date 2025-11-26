import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  format?: "number" | "percent" | "score";
  className?: string;
}

export function MetricsCard({
  title,
  value,
  icon,
  trend,
  format = "number",
  className,
}: MetricsCardProps) {
  const formatValue = () => {
    if (typeof value === "string") return value;
    switch (format) {
      case "percent":
        return `${value}%`;
      case "score":
        return value.toFixed(1);
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Card className={cn("overflow-visible", className)} data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight">{formatValue()}</p>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  trend.isPositive ? "text-safe" : "text-high-risk"
                )}
              >
                {trend.value === 0 ? (
                  <Minus className="h-3 w-3" />
                ) : trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}% from last week
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
