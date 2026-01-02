import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Search,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  Home,
  Sparkles,
  Briefcase,
  HelpCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";

const categoryIcons: Record<string, { icon: any; color: string; bg: string }> = {
  shopping: { icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  food: { icon: Utensils, color: "text-accent", bg: "bg-accent/10" },
  transport: { icon: Car, color: "text-warning", bg: "bg-warning/10" },
  utilities: { icon: Zap, color: "text-purple-400", bg: "bg-purple-400/10" },
  entertainment: { icon: Film, color: "text-pink-400", bg: "bg-pink-400/10" },
  housing: { icon: Home, color: "text-blue-400", bg: "bg-blue-400/10" },
  salary: { icon: Briefcase, color: "text-success", bg: "bg-success/10" },
  other: { icon: HelpCircle, color: "text-muted-foreground", bg: "bg-secondary" },
};

const categories = ["Food", "Shopping", "Transport", "Utilities", "Entertainment", "Housing", "Other"];

export default function Expenses() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { transactions, isLoading, deleteTransaction } = useTransactions();

  const filteredExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .filter(t => activeCategory === "All" || t.category.toLowerCase() === activeCategory.toLowerCase())
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your spending
            </p>
          </div>
          <AddTransactionDialog type="expense" categories={categories} />
        </div>

        {/* Smart Suggestion */}
        <div className="glass-card p-4 bg-gradient-to-r from-accent/10 via-card to-primary/10 border-accent/20 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Smart Suggestion</p>
              <p className="text-sm text-muted-foreground">
                Track your expenses regularly to get personalized money-saving tips!
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2 shrink-0">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("All")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredExpenses && filteredExpenses.length > 0 ? (
          <div className="glass-card divide-y divide-border animate-slide-up">
            {filteredExpenses.map((expense, index) => {
              const categoryKey = expense.category.toLowerCase();
              const categoryData = categoryIcons[categoryKey] || categoryIcons.other;
              const Icon = categoryData.icon;

              return (
                <div
                  key={expense.id}
                  className="p-4 lg:p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", categoryData.bg)}>
                      <Icon className={cn("w-5 h-5", categoryData.color)} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{expense.payment_method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        -₹{Number(expense.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {expense.category}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this expense?')) {
                          deleteTransaction.mutate(expense.id);
                        }
                      }}
                      disabled={deleteTransaction.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 glass-card">
            <p className="text-muted-foreground">No expenses found.</p>
            <p className="text-sm text-muted-foreground/50 mt-1">Add an expense to get started!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
