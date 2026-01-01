import {
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  ArrowUpRight,
  ArrowDownRight,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { memo } from "react";

const categoryIcons = {
  shopping: ShoppingBag,
  food: Utensils,
  transport: Car,
  utilities: Zap,
  entertainment: Film,
};

export const RecentTransactions = memo(function RecentTransactions() {
  const { transactions, isLoading } = useTransactions();

  // Show only last 5 transactions for the dashboard
  const displayTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Your latest activity</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons for smoothness
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-secondary rounded" />
                  <div className="h-3 w-20 bg-secondary rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-secondary rounded" />
            </div>
          ))
        ) : displayTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-50">
            <Inbox className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No recent transactions</p>
          </div>
        ) : (
          displayTransactions.map((transaction, index) => {
            const Icon = categoryIcons[transaction.category as keyof typeof categoryIcons] || ShoppingBag;
            const isIncome = transaction.type === 'income';

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-110",
                      isIncome ? "bg-success/10" : "bg-secondary"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isIncome ? "text-success" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {transaction.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isIncome ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      isIncome ? "text-success" : "text-foreground"
                    )}
                  >
                    {isIncome ? "+" : ""}₹{Math.abs(Number(transaction.amount)).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
