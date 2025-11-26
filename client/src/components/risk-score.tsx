import { cn } from "@/lib/utils";
import type { RiskLevel } from "@shared/schema";

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { container: "w-14 h-14", text: "text-lg", stroke: 3 },
  md: { container: "w-20 h-20", text: "text-2xl", stroke: 4 },
  lg: { container: "w-24 h-24", text: "text-3xl", stroke: 5 },
};

const levelColors = {
  safe: {
    ring: "stroke-safe",
    text: "text-safe",
    bg: "bg-safe/10",
    label: "Safe",
  },
  medium: {
    ring: "stroke-medium-risk",
    text: "text-medium-risk",
    bg: "bg-medium-risk/10",
    label: "Medium Risk",
  },
  high: {
    ring: "stroke-high-risk",
    text: "text-high-risk",
    bg: "bg-high-risk/10",
    label: "High Risk",
  },
};

export function RiskScore({
  score,
  level,
  size = "md",
  showLabel = true,
  className,
}: RiskScoreProps) {
  const sizeConfig = sizeClasses[size];
  const colorConfig = levelColors[level];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className={cn("relative", sizeConfig.container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(colorConfig.ring, "transition-all duration-1000 ease-out")}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-semibold", sizeConfig.text, colorConfig.text)}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", colorConfig.text)}>{colorConfig.label}</span>
      )}
    </div>
  );
}

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const colorConfig = levelColors[level];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        colorConfig.bg,
        colorConfig.text,
        className
      )}
      data-testid={`badge-risk-${level}`}
    >
      {colorConfig.label}
    </span>
  );
}
