import { LucideIcon, TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, CreditCard, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface StatCardProps {
  title: string;
  amount: number | string;
  change?: number; // Usage: percentage change
  type: "balance" | "income" | "expense" | "savings" | "neutral";
  loading?: boolean;
  delay?: number;
}

const CONFIG = {
  balance: {
    icon: Wallet,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  income: {
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  expense: {
    icon: TrendingDown,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  savings: {
    icon: PiggyBank,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  neutral: {
    icon: Activity,
    color: "text-muted-foreground",
    bgColor: "bg-secondary",
  }
};

export const StatCard = memo(function StatCard({
  title,
  amount,
  change,
  type = "neutral",
  loading = false,
  delay = 0,
}: StatCardProps) {
  const { icon: Icon, color, bgColor } = CONFIG[type] || CONFIG.neutral;
  const isPositive = change !== undefined && change >= 0;

  // Format amount usually as currency
  const formattedAmount = typeof amount === 'number'
    ? `₹${amount.toLocaleString()}`
    : amount;

  const formattedChange = change !== undefined
    ? `${Math.abs(change).toFixed(1)}%`
    : null;

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse" style={{ animationDelay: `${delay}ms` }}>
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-secondary rounded" />
            <div className="h-8 w-32 bg-secondary rounded" />
            <div className="h-3 w-16 bg-secondary rounded" />
          </div>
          <div className="h-12 w-12 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card p-6 animate-slide-up hover:scale-[1.02] transition-transform duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground animate-count-up">
            {formattedAmount}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium flex items-center",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {formattedChange}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl",
            bgColor,
            color
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
});
