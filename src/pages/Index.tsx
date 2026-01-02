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
import { Calendar, Shield, Info, Link as LinkIcon } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

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
      <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* SEO H1 Header - Hidden or Styled gracefully */}
        <header className="space-y-2 animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground gradient-text">
            FutoraPay – The #1 AI Financial Operating System
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, <span className="text-foreground font-semibold">{user?.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>. Here is your enterprise financial overview.
          </p>
        </header>

        {/* Smart Insight Banner */}
        <SmartInsightBanner transactions={transactions || []} />

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </section>

        {/* Charts & Analytics Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              AI-Powered Financial Management
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingChart />
            <CategoryPieChart />
          </div>
        </section>

        {/* Main Dashboard Interaction */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold px-1">Track Net Worth, Expenses, and Assets</h2>
            <RecentTransactions />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold px-1">CFO-Level Insights for Success</h2>
            <GoalsProgress />
          </div>
        </section>

        {/* Upcoming Subscriptions */}
        {upcomingSubscriptions.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Subscription Payments
            </h3>
            <Card className="glass-card animate-slide-up">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {upcomingSubscriptions.map((sub) => {
                    const daysUntil = Math.ceil((new Date(sub.next_billing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all border border-transparent hover:border-primary/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl shadow-inner">
                            {sub.icon || '💳'}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{sub.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{new Date(sub.next_billing_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                              {daysUntil <= 3 && (
                                <Badge variant="destructive" className="text-[10px] h-4 py-0 font-bold uppercase tracking-wider">
                                  Due {daysUntil === 0 ? 'today' : `in ${daysUntil}d`}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-black text-primary">₹ {Number(sub.amount).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* SEO Content Section - The "Financial Truth Layer" */}
        <section className="mt-16 pt-16 border-t border-border/50 max-w-4xl mx-auto space-y-8 mb-12 animate-fade-in">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold gradient-text">Why FutoraPay Is the Future of Finance</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              FutoraPay is a next-generation <strong className="text-foreground">AI-powered financial management platform</strong> built to become the
              <span className="text-primary font-medium"> single source of truth for money data</span>. Designed by
              <strong className="text-foreground italic"> Madhur Dhadve</strong>, FutoraPay goes beyond traditional budgeting apps
              by functioning as a complete <strong className="text-foreground">Financial Operating System</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-4 p-6 rounded-2xl bg-secondary/10 border border-border/50 hover:bg-secondary/20 transition-colors">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-accent" />
                Audit-Safe Reports & Insights
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                With FutoraPay, users can track expenses, manage assets and liabilities, monitor real-time net worth,
                and generate professional financial reports — all in one secure platform. Unlike auto-synced finance apps,
                FutoraPay follows a <strong className="text-foreground">manual-first approach</strong>, ensuring clean,
                auditable, and trustworthy financial data for serious money management.
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-2xl bg-secondary/10 border border-border/50 hover:bg-secondary/20 transition-colors">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Info className="w-5 h-5 text-accent" />
                CFO-Level Financial Intelligence
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                FutoraPay delivers <strong className="text-foreground">CFO-level insights</strong> using intelligent analytics
                and AI-powered reasoning, helping individuals, startups, and businesses make smarter financial decisions.
                As part of the <strong className="text-foreground">Futora Group</strong>, FutoraPay represents the future of
                finance — where data accuracy, transparency, and AI-driven intelligence converge.
              </p>
            </div>
          </div>

          {/* Internal SEO Links */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <Link to="/reports" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
              <LinkIcon className="w-4 h-4" />
              Audit-Safe Reports
            </Link>
            <Link to="/insights" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
              <LinkIcon className="w-4 h-4" />
              CFO Insights
            </Link>
            <Link to="/net-worth" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
              <LinkIcon className="w-4 h-4" />
              Track Net Worth
            </Link>
            <a href="https://futoragroup.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors">
              Futora Group of Companies
            </a>
          </div>
        </section>

        {/* Global Action Trigger */}
        <AddTransactionDialog type="expense" categories={categories} />
      </div>
    </DashboardLayout>
  );
}
