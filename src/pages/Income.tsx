import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";

const categories = ["Salary", "Freelance", "Investment", "Rental", "Other"];

const incomeSourceIcons: Record<string, { icon: any; color: string; bg: string }> = {
  salary: { icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
  freelance: { icon: Laptop, color: "text-accent", bg: "bg-accent/10" },
  investment: { icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  rental: { icon: Building2, color: "text-warning", bg: "bg-warning/10" },
  other: { icon: HelpCircle, color: "text-muted-foreground", bg: "bg-secondary" },
};

export default function Income() {
  const { transactions, isLoading, deleteTransaction } = useTransactions();

  // Filter for income only
  const incomeTransactions = transactions?.filter(t => t.type === 'income') || [];

  // Calculate total monthly income (for current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthIncome = incomeTransactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate YTD Income
  const ytdIncome = incomeTransactions
    .filter(t => new Date(t.date).getFullYear() === currentYear)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Prepare Chart Data (Last 6 months)
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthName = d.toLocaleString('default', { month: 'short' });
    const monthIndex = d.getMonth();
    const year = d.getFullYear();

    const monthTransactions = incomeTransactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === monthIndex && td.getFullYear() === year;
    });

    return {
      month: monthName,
      salary: monthTransactions.filter(t => t.category.toLowerCase() === 'salary').reduce((sum, t) => sum + Number(t.amount), 0),
      freelance: monthTransactions.filter(t => t.category.toLowerCase() === 'freelance').reduce((sum, t) => sum + Number(t.amount), 0),
      other: monthTransactions.filter(t => !['salary', 'freelance'].includes(t.category.toLowerCase())).reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  // Calculate Income Sources Breakdown
  const sourcesBreakdown = incomeTransactions.reduce((acc, t) => {
    const key = t.category.toLowerCase();
    acc[key] = (acc[key] || 0) + Number(t.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Income & Cash Flow</h1>
            <p className="text-muted-foreground">
              Track your earnings and cash flow
            </p>
          </div>
          <AddTransactionDialog type="income" categories={categories} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card-elevated p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total Monthly Income</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? "..." : `₹${currentMonthIncome.toLocaleString()}`}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Active</span>
              <span className="text-xs text-muted-foreground">this month</span>
            </div>
          </div>

          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Predicted Next Month</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold gradient-text">
              {isLoading ? "..." : `₹${(currentMonthIncome * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Estimated growth
            </p>
          </div>

          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">YTD Earnings</span>
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? "..." : `₹${ytdIncome.toLocaleString()}`}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Jan - Dec {currentYear}
            </p>
          </div>
        </div>

        {/* Income Chart */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Income Breakdown</h3>
              <p className="text-sm text-muted-foreground">Last 6 months performance</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Salary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Freelance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Other</span>
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 20%, 18%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 25%, 10%)",
                      border: "1px solid hsl(220, 20%, 18%)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="salary" stackId="a" fill="hsl(187, 100%, 50%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="freelance" stackId="a" fill="hsl(160, 100%, 45%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="other" stackId="a" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Income Sources List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Income Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(sourcesBreakdown).map(([category, amount], index) => {
              const iconData = incomeSourceIcons[category.toLowerCase()] || incomeSourceIcons.other;
              const Icon = iconData.icon;
              return (
                <div
                  key={category}
                  className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br opacity-20",
                      iconData.bg.replace('/10', '/30')
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        iconData.color
                      )} />
                    </div>
                  </div>
                  <h4 className="font-medium text-foreground capitalize">{category}</h4>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    ₹{amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
            {Object.keys(sourcesBreakdown).length === 0 && !isLoading && (
              <div className="col-span-3 glass-card p-8 text-center">
                <p className="text-muted-foreground">No income sources found yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Income History */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Income History</h3>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : incomeTransactions && incomeTransactions.length > 0 ? (
            <div className="glass-card divide-y divide-border animate-slide-up">
              {incomeTransactions.map((income, index) => {
                const categoryKey = income.category.toLowerCase();
                const iconData = incomeSourceIcons[categoryKey] || incomeSourceIcons.other;
                const Icon = iconData.icon;

                return (
                  <div
                    key={income.id}
                    className="p-4 lg:p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl", iconData.bg)}>
                        <Icon className={cn("w-5 h-5", iconData.color)} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{income.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{new Date(income.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{income.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-foreground text-success">
                          +₹{Number(income.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {income.category}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this income record?')) {
                            deleteTransaction.mutate(income.id);
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
              <p className="text-muted-foreground">No income records found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
