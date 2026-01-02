import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SmartInsightBanner } from "@/components/dashboard/SmartInsightBanner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFinanceStats } from "@/hooks/useFinanceStats";
import { useTransactions } from "@/hooks/useTransactions";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { Loader2 } from "lucide-react";

const categories = ["Food", "Shopping", "Transport", "Utilities", "Entertainment", "Housing", "Other"];

export default function Index() {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useFinanceStats();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  const loading = statsLoading || transactionsLoading;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your financial overview for today.
            </p>
          </div>
        </div>

        {/* Smart Insight Banner */}
        <SmartInsightBanner transactions={transactions || []} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Balance"
            amount={stats.totalBalance}
            change={stats.balanceChange}
            type="balance"
            loading={loading}
          />
          <StatCard
            title="Monthly Income"
            amount={stats.monthlyIncome}
            change={stats.incomeChange}
            type="income"
            loading={loading}
          />
          <StatCard
            title="Monthly Expenses"
            amount={stats.monthlyExpenses}
            change={stats.expensesChange}
            type="expense"
            loading={loading}
          />
          <StatCard
            title="Savings"
            amount={stats.savings}
            change={stats.savingsChange} // Pass 0 or calculation if available
            type="savings"
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SpendingChart />
            <RecentTransactions />
          </div>
          <div className="space-y-6">
            <CategoryPieChart />
            <GoalsProgress />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
