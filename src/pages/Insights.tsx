import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Lightbulb,
    Target,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    XCircle,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTransactions } from "@/hooks/useTransactions";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useMemo } from "react";

const getSeverityConfig = (severity: string) => {
    switch (severity) {
        case "critical":
            return {
                icon: AlertTriangle,
                badge: "high-priority",
                bgColor: "bg-destructive/5",
                borderColor: "border-destructive/20",
                iconColor: "text-destructive"
            };
        case "warning":
            return {
                icon: TrendingUp,
                badge: "attention",
                bgColor: "bg-warning/5",
                borderColor: "border-warning/20",
                iconColor: "text-warning"
            };
        default:
            return {
                icon: Lightbulb,
                badge: "insight",
                bgColor: "bg-primary/5",
                borderColor: "border-primary/20",
                iconColor: "text-primary"
            };
    }
};

export default function Insights() {
    const { transactions } = useTransactions();
    const { subscriptions } = useSubscriptions();

    const insights = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        });

        const generatedInsights = [];

        // Category spending analysis
        const categoryMap = new Map<string, { current: number; prev: number }>();

        currentMonthTxns.forEach(t => {
            if (t.type === 'expense') {
                const cat = t.category || 'Other';
                const current = categoryMap.get(cat) || { current: 0, prev: 0 };
                current.current += Number(t.amount);
                categoryMap.set(cat, current);
            }
        });

        prevMonthTxns.forEach(t => {
            if (t.type === 'expense') {
                const cat = t.category || 'Other';
                const current = categoryMap.get(cat) || { current: 0, prev: 0 };
                current.prev += Number(t.amount);
                categoryMap.set(cat, current);
            }
        });

        // Check for anomalies (>50% increase)
        categoryMap.forEach((amounts, category) => {
            if (amounts.prev > 0) {
                const increase = ((amounts.current - amounts.prev) / amounts.prev) * 100;
                if (increase > 50) {
                    generatedInsights.push({
                        id: generatedInsights.length + 1,
                        type: "spending_anomaly",
                        severity: increase > 100 ? "critical" : "warning",
                        title: `Unusual ${category} Spend`,
                        description: `You spent ₹${amounts.current.toLocaleString()} on ${category} this month, which is ${increase.toFixed(0)}% higher than last month.`,
                        impact: -(amounts.current - amounts.prev),
                        actionable: true,
                        dismissed: false,
                        category,
                        date: now.toISOString().split('T')[0]
                    });
                }
            }
        });

        // SUBSCRIPTION-BASED INSIGHTS
        if (subscriptions && subscriptions.length > 0) {
            const activeSubscriptions = subscriptions.filter(s => s.is_active);
            const totalSubscriptionCost = activeSubscriptions
                .filter(s => s.billing_cycle === 'monthly')
                .reduce((sum, s) => sum + Number(s.amount), 0);

            // Subscription cost insight
            if (totalSubscriptionCost > 0) {
                const avgExpense = currentMonthTxns
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + Number(t.amount), 0) / (currentMonthTxns.length || 1);

                if (totalSubscriptionCost > avgExpense * 0.3) {
                    generatedInsights.push({
                        id: generatedInsights.length + 1,
                        type: "subscription_insight",
                        severity: "warning",
                        title: "High Subscription Spending",
                        description: `Your subscriptions cost ₹${totalSubscriptionCost.toLocaleString()}/month. This is ${((totalSubscriptionCost / (avgExpense * currentMonthTxns.length)) * 100).toFixed(0)}% of your monthly expenses.`,
                        impact: -totalSubscriptionCost,
                        actionable: true,
                        dismissed: false,
                        category: "Subscriptions",
                        date: now.toISOString().split('T')[0]
                    });
                }
            }

            // Upcoming subscription payments
            const dueThisWeek = activeSubscriptions.filter(s => {
                const daysUntil = Math.ceil((new Date(s.next_billing_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntil >= 0 && daysUntil <= 7;
            });

            if (dueThisWeek.length > 0) {
                const totalDue = dueThisWeek.reduce((sum, s) => sum + Number(s.amount), 0);
                generatedInsights.push({
                    id: generatedInsights.length + 1,
                    type: "cash_flow_warning",
                    severity: totalDue > 5000 ? "critical" : "warning",
                    title: "Subscriptions Due This Week",
                    description: `You have ${dueThisWeek.length} subscriptions totaling ₹${totalDue.toLocaleString()} due in the next 7 days.`,
                    impact: -totalDue,
                    actionable: true,
                    dismissed: false,
                    category: "Bills",
                    date: now.toISOString().split('T')[0]
                });
            }

            // Inactive subscriptions warning
            const inactiveSubscriptions = subscriptions.filter(s => !s.is_active);
            if (inactiveSubscriptions.length > 0) {
                generatedInsights.push({
                    id: generatedInsights.length + 1,
                    type: "goal_recommendation",
                    severity: "info",
                    title: "Review Inactive Subscriptions",
                    description: `You have ${inactiveSubscriptions.length} inactive subscriptions. Consider deleting them if no longer needed.`,
                    impact: 0,
                    actionable: true,
                    dismissed: false,
                    category: null,
                    date: now.toISOString().split('T')[0]
                });
            }
        }

        // Savings opportunity
        const totalExpenseCurrentMonth = currentMonthTxns
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        if (totalExpenseCurrentMonth > 0) {
            generatedInsights.push({
                id: generatedInsights.length + 1,
                type: "savings_opportunity",
                severity: "info",
                title: "Potential Monthly Savings",
                description: `By reducing discretionary spending by 10%, you could save ₹${(totalExpenseCurrentMonth * 0.1).toLocaleString()}/month.`,
                impact: totalExpenseCurrentMonth * 0.1,
                actionable: true,
                dismissed: false,
                category: null,
                date: now.toISOString().split('T')[0]
            });
        }

        return generatedInsights;
    }, [transactions, subscriptions]);

    const handleDismiss = (id: number) => {
        toast.success("Insight dismissed");
    };

    const handleAction = (insight: typeof insights[0]) => {
        toast.info(`Taking action on: ${insight.title}`);
    };

    if (!transactions && !subscriptions) {
        return (
            <DashboardLayout>
                <div className="p-4 lg:p-8 flex items-center justify-center min-h-screen">
                    <div className="text-muted-foreground">Loading insights...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">AI Insights</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Smart recommendations powered by your spending patterns & subscriptions
                        </p>
                    </div>
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {insights.filter(i => !i.dismissed).length} Active Insights
                    </Badge>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Savings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">
                                ₹ {insights.filter(i => i.impact > 0).reduce((sum, i) => sum + i.impact, 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Anomalies Detected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-warning">
                                {insights.filter(i => i.severity === 'warning' || i.severity === 'critical').length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Data Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary flex items-center gap-2">
                                <RefreshCw className="w-5 h-5" />
                                {(subscriptions?.length || 0) + (transactions?.length || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Transactions + Subscriptions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights List */}
                <div className="space-y-3">
                    {insights.map((insight) => {
                        const config = getSeverityConfig(insight.severity);
                        const Icon = config.icon;

                        return (
                            <Card
                                key={insight.id}
                                className={cn(
                                    "glass-card-elevated transition-all hover:scale-[1.01]",
                                    config.bgColor,
                                    config.borderColor
                                )}
                            >
                                <CardContent className="p-4 lg:p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("p-3 rounded-xl bg-secondary/50", config.iconColor)}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{insight.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {insight.description}
                                                    </p>
                                                </div>
                                                {insight.impact !== 0 && (
                                                    <div className={cn(
                                                        "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md",
                                                        insight.impact > 0
                                                            ? "text-success bg-success/10"
                                                            : "text-destructive bg-destructive/10"
                                                    )}>
                                                        {insight.impact > 0 ? (
                                                            <TrendingUp className="w-3 h-3" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3" />
                                                        )}
                                                        ₹{Math.abs(insight.impact).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="secondary" className="text-xs">
                                                    {insight.type.replace(/_/g, ' ')}
                                                </Badge>
                                                {insight.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {insight.category}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(insight.date).toLocaleDateString('en-IN', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            {insight.actionable && (
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="gap-1"
                                                        onClick={() => handleAction(insight)}
                                                    >
                                                        Take Action
                                                        <ArrowRight className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDismiss(insight.id)}
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Dismiss
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {insights.length === 0 && (
                    <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No Insights Yet
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Keep tracking your transactions and subscriptions. Our AI will analyze your spending patterns and provide personalized insights.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
