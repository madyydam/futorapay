import {
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons = {
  shopping: ShoppingBag,
  food: Utensils,
  transport: Car,
  utilities: Zap,
  entertainment: Film,
};

const transactions = [
  {
    id: 1,
    name: "Amazon Purchase",
    category: "shopping" as keyof typeof categoryIcons,
    amount: -4599,
    date: "Today, 2:30 PM",
  },
  {
    id: 2,
    name: "Salary Credit",
    category: "utilities" as keyof typeof categoryIcons,
    amount: 75000,
    date: "Today, 9:00 AM",
  },
  {
    id: 3,
    name: "Swiggy Order",
    category: "food" as keyof typeof categoryIcons,
    amount: -485,
    date: "Yesterday, 8:45 PM",
  },
  {
    id: 4,
    name: "Uber Ride",
    category: "transport" as keyof typeof categoryIcons,
    amount: -320,
    date: "Yesterday, 6:20 PM",
  },
  {
    id: 5,
    name: "Netflix Subscription",
    category: "entertainment" as keyof typeof categoryIcons,
    amount: -649,
    date: "2 days ago",
  },
];

export function RecentTransactions() {
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
        {transactions.map((transaction) => {
          const Icon = categoryIcons[transaction.category];
          const isIncome = transaction.amount > 0;

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-lg",
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
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
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
                  {isIncome ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
