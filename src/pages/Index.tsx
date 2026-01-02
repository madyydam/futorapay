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
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useMemo } from "react";

const categories = ["Food", "Shopping", "Transport", "Utilities", "Entertainment", "Housing", "Other"];

export default function Index() {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useFinanceStats();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { subscriptions } = useSubscriptions();

  const loading = statsLoading || transactionsLoading;

  // Upcoming subscriptions (next 5)
  const upcomingSubscriptions = useMemo(() => {
    if (!subscriptions) return [];
    return subscriptions
      .filter(s => s.is_active)
      .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime())
      .slice(0, 5);
  }, [subscriptions]);

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
            change={stats.savingsChange}
            type="savings"
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart />
          <CategoryPieChart />
        </div>

        {/* Transactions & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions />
          <GoalsProgress />
        </div>

        {/* Upcoming Subscriptions - RESTORED AT THE END */}
        {upcomingSubscriptions.length > 0 && (
          <Card className="glass-card animate-slide-up" style={{ animationDelay: "600ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Subscription Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingSubscriptions.map((sub) => {
                  const daysUntil = Math.ceil((new Date(sub.next_billing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{sub.icon || '💳'}</div>
                        <div>
                          <div className="font-medium">{sub.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(sub.next_billing_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            {daysUntil <= 3 && (
                              <Badge variant="destructive" className="ml-2 text-[10px] h-4 py-0">
                                Due {daysUntil === 0 ? 'today' : `in ${daysUntil}d`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">₹ {Number(sub.amount).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <AddTransactionDialog type="expense" categories={categories} />
      </div>
    </DashboardLayout>
  );
}
