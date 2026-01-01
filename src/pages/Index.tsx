import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AIInsightBanner } from "@/components/dashboard/AIInsightBanner";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart,
} from "lucide-react";

const Index = () => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}, <span className="gradient-text">Madhur</span> 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your finances today
          </p>
        </div>

        {/* Smart Insight Banner */}
        <AIInsightBanner
          insight="You've spent 18% more on food this month compared to last month. Consider meal planning to reduce expenses."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Balance"
            value="₹2,45,680"
            change={{ value: "8.2%", isPositive: true }}
            icon={Wallet}
            iconColor="text-primary"
            delay={0}
          />
          <StatCard
            title="Monthly Income"
            value="₹75,000"
            change={{ value: "5.0%", isPositive: true }}
            icon={TrendingUp}
            iconColor="text-success"
            delay={50}
          />
          <StatCard
            title="Monthly Expenses"
            value="₹48,500"
            change={{ value: "12.3%", isPositive: false }}
            icon={TrendingDown}
            iconColor="text-destructive"
            delay={100}
          />
          <StatCard
            title="Savings Rate"
            value="35.3%"
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

        {/* Quick Actions Card */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Investment Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Your portfolio has grown 12.5% this quarter. View detailed analysis.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                View Portfolio
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Add Investment
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
