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
  Plus,
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const incomeData = [
  { month: "Jul", salary: 65000, freelance: 15000, other: 5000 },
  { month: "Aug", salary: 65000, freelance: 22000, other: 3000 },
  { month: "Sep", salary: 70000, freelance: 18000, other: 8000 },
  { month: "Oct", salary: 70000, freelance: 25000, other: 4000 },
  { month: "Nov", salary: 75000, freelance: 20000, other: 6000 },
  { month: "Dec", salary: 75000, freelance: 28000, other: 10000 },
];

const incomeSources = [
  {
    id: 1,
    name: "Full-time Salary",
    amount: 75000,
    icon: Briefcase,
    color: "from-primary to-cyan-400",
    change: "+7.1%",
    frequency: "Monthly",
  },
  {
    id: 2,
    name: "Freelance Projects",
    amount: 28000,
    icon: Laptop,
    color: "from-accent to-emerald-400",
    change: "+40%",
    frequency: "Variable",
  },
  {
    id: 3,
    name: "Rental Income",
    amount: 10000,
    icon: Building2,
    color: "from-warning to-orange-400",
    change: "+0%",
    frequency: "Monthly",
  },
];

export default function Income() {
  const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);

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
          <Button variant="gradient" className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Add Income
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card-elevated p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total Monthly Income</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              ₹{totalIncome.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">+12.3%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>

          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Predicted Next Month</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold gradient-text">
              ₹1,18,000
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Based on system analysis
            </p>
          </div>

          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">YTD Earnings</span>
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              ₹12.8L
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Jan - Dec 2025
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData} barGap={4}>
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
          </div>
        </div>

        {/* Income Sources */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Income Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {incomeSources.map((source, index) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.id}
                  className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br opacity-20",
                      source.color
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        source.color.includes("primary") ? "text-primary" :
                          source.color.includes("accent") ? "text-accent" :
                            "text-warning"
                      )} />
                    </div>
                    <span className="text-xs text-success font-medium bg-success/10 px-2 py-1 rounded-full">
                      {source.change}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground">{source.name}</h4>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    ₹{source.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {source.frequency}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
