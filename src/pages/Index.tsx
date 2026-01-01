import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SmartInsightBanner } from "@/components/dashboard/SmartInsightBanner";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useFinanceStats } from "@/hooks/useFinanceStats";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart,
} from "lucide-react";
import { useMemo } from "react";

const Index = () => {
  const { user } = useAuth();
  const { totalBalance, monthlyIncome, monthlyExpenses, savingsRate, isLoading } = useFinanceStats();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}, <span className="gradient-text">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your finances today
          </p>
        </div>

        {/* Smart Insight Banner */}
        <SmartInsightBanner
          insight="You've spent 18% more on food this month compared to last month. Consider meal planning to reduce expenses."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Balance"
            value={isLoading ? "..." : `₹${totalBalance.toLocaleString()}`}
            change={{ value: "8.2%", isPositive: true }}
            icon={Wallet}
            iconColor="text-primary"
            delay={0}
          />
          <StatCard
            title="Monthly Income"
            value={isLoading ? "..." : `₹${monthlyIncome.toLocaleString()}`}
            change={{ value: "5.0%", isPositive: true }}
            icon={TrendingUp}
            iconColor="text-success"
            delay={50}
          />
          <StatCard
            title="Monthly Expenses"
            value={isLoading ? "..." : `₹${monthlyExpenses.toLocaleString()}`}
            change={{ value: "12.3%", isPositive: false }}
            icon={TrendingDown}
            iconColor="text-destructive"
            delay={100}
          />
          <StatCard
            title="Savings Rate"
            value={isLoading ? "..." : `${savingsRate.toFixed(1)}%`}
            change={{ value: "2.1%", isPositive: true }}
            icon={PiggyBank}
            iconColor="text-accent"
            delay={150}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SpendingChart />
          <CategoryPieChart />
        </div>

        {/* Goals and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalsProgress />
          <RecentTransactions />
        </div>

        {/* Quick Actions Card - Optimized for visual smoothness */}
        <div className="glass-card p-6 animate-slide-up hover:border-primary/50 transition-colors duration-300" style={{ animationDelay: "600ms" }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-semibold text-foreground">Spending Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Your monthly summary is ready. Auto-generated sheets are available.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button className="flex-1 lg:flex-none px-6 py-2.5 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-all duration-200">
                View Reports
              </button>
              <button className="flex-1 lg:flex-none px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20">
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
