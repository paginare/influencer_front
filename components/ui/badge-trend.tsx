import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeTrendProps {
  value: number;
  className?: string;
}

export function BadgeTrend({ value, className }: BadgeTrendProps) {
  const isPositive = value >= 0;
  const displayValue = Math.abs(value).toFixed(1);
  
  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        isPositive 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800",
        className
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3 mr-1" />
      ) : (
        <TrendingDown className="h-3 w-3 mr-1" />
      )}
      {displayValue}%
    </div>
  );
} 