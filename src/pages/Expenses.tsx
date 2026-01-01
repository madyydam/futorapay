import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Filter,
  Search,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  Home,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons = {
  shopping: { icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  food: { icon: Utensils, color: "text-accent", bg: "bg-accent/10" },
  transport: { icon: Car, color: "text-warning", bg: "bg-warning/10" },
  utilities: { icon: Zap, color: "text-purple-400", bg: "bg-purple-400/10" },
  entertainment: { icon: Film, color: "text-pink-400", bg: "bg-pink-400/10" },
  housing: { icon: Home, color: "text-blue-400", bg: "bg-blue-400/10" },
};

const expenses = [
  {
    id: 1,
    name: "Amazon Purchase",
    category: "shopping" as keyof typeof categoryIcons,
    amount: 4599,
    date: "Dec 28, 2025",
    paymentMethod: "Credit Card",
  },
  {
    id: 2,
    name: "Grocery Shopping",
    category: "food" as keyof typeof categoryIcons,
    amount: 2850,
    date: "Dec 27, 2025",
    paymentMethod: "UPI",
  },
  {
    id: 3,
    name: "Electricity Bill",
    category: "utilities" as keyof typeof categoryIcons,
    amount: 3200,
    date: "Dec 26, 2025",
    paymentMethod: "Auto Debit",
  },
  {
    id: 4,
    name: "Uber Rides",
    category: "transport" as keyof typeof categoryIcons,
    amount: 1560,
    date: "Dec 25, 2025",
    paymentMethod: "Wallet",
  },
  {
    id: 5,
    name: "Netflix & Spotify",
    category: "entertainment" as keyof typeof categoryIcons,
    amount: 1148,
    date: "Dec 24, 2025",
    paymentMethod: "Credit Card",
  },
  {
    id: 6,
    name: "House Rent",
    category: "housing" as keyof typeof categoryIcons,
    amount: 25000,
    date: "Dec 1, 2025",
    paymentMethod: "Bank Transfer",
  },
];

const categories = ["All", "Food", "Shopping", "Transport", "Utilities", "Entertainment", "Housing"];

export default function Expenses() {
  const [activeCategory, setActiveCategory] = useState("All");

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
          <Button variant="gradient" className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        {/* AI Suggestion */}
        <div className="glass-card p-4 bg-gradient-to-r from-accent/10 via-card to-primary/10 border-accent/20 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">AI Suggestion</p>
              <p className="text-sm text-muted-foreground">
                You can save ₹3,200 by reducing subscriptions. 
                Consider canceling unused services.
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
        <div className="glass-card divide-y divide-border animate-slide-up">
          {expenses.map((expense, index) => {
            const categoryData = categoryIcons[expense.category];
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
                      <span>{expense.date}</span>
                      <span>•</span>
                      <span>{expense.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    -₹{expense.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {expense.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
