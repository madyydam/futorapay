import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    Target,
    PiggyBank,
    Calendar,
    ArrowRight,
    BarChart3,
    Zap,
    RefreshCw,
    Bell,
    ThumbsUp,
    ThumbsDown,
    Brain,
    Shield,
    Eye,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { useFinanceStats } from "@/hooks/useFinanceStats";

interface Insight {
    id: string;
    type: "spending_anomaly" | "savings_opportunity" | "bill_prediction" | "category_trend" | "goal_recommendation";
    severity: "info" | "warning" | "critical";
    title: string;
    description: string;
    impact?: number;
    actionLabel?: string;
    dismissed?: boolean;
    created: Date;
}

const insightTypes = {
    spending_anomaly: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    savings_opportunity: { icon: PiggyBank, color: "text-success", bg: "bg-success/10" },
    bill_prediction: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
    category_trend: { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    goal_recommendation: { icon: Target, color: "text-accent", bg: "bg-accent/10" },
};

export default function Insights() {
    const { transactions, isLoading } = useTransactions();
    const { stats } = useFinanceStats();
    const [activeTab, setActiveTab] = useState("all");

    // Generate rule-based insights from transaction data
    const insights = useMemo<Insight[]>(() => {
        if (!transactions || transactions.length === 0) return [];

        const generatedInsights: Insight[] = [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get current month & last month transactions
        const currentMonthTxn = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonthTxn = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        // Category-wise analysis
        const categoryTotals = new Map<string, { current: number; last: number }>();

        currentMonthTxn.filter(t => t.type === 'expense').forEach(t => {
            const cat = t.category || 'Other';
            if (!categoryTotals.has(cat)) categoryTotals.set(cat, { current: 0, last: 0 });
            categoryTotals.get(cat)!.current += Number(t.amount);
        });

        lastMonthTxn.filter(t => t.type === 'expense').forEach(t => {
            const cat = t.category || 'Other';
            if (!categoryTotals.has(cat)) categoryTotals.set(cat, { current: 0, last: 0 });
            categoryTotals.get(cat)!.last += Number(t.amount);
        });

        // 1. Spending Anomaly Detection
        categoryTotals.forEach((amounts, category) => {
            if (amounts.last > 0) {
                const change = ((amounts.current - amounts.last) / amounts.last) * 100;
                if (change > 50) {
                    generatedInsights.push({
                        id: `anomaly-${category}`,
                        type: "spending_anomaly",
                        severity: change > 100 ? "critical" : "warning",
                        title: `${category} spending up ${Math.round(change)}%`,
                        description: `Your ${category.toLowerCase()} spending increased significantly from ₹${amounts.last.toLocaleString()} to ₹${amounts.current.toLocaleString()} this month.`,
                        impact: amounts.current - amounts.last,
                        actionLabel: "Review Expenses",
                        created: now,
                    });
                }
            }
        });

        // 2. Savings Opportunity
        const savingsRate = stats.monthlyIncome > 0
            ? ((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100
            : 0;

        if (savingsRate < 20 && stats.monthlyIncome > 0) {
            generatedInsights.push({
                id: "savings-rate-low",
                type: "savings_opportunity",
                severity: savingsRate < 10 ? "critical" : "warning",
                title: "Low savings rate detected",
                description: `You're only saving ${savingsRate.toFixed(1)}% of your income. Aim for at least 20% for financial health.`,
                impact: stats.monthlyIncome * 0.2 - (stats.monthlyIncome - stats.monthlyExpenses),
                actionLabel: "View Budget Tips",
                created: now,
            });
        } else if (savingsRate >= 30) {
            generatedInsights.push({
                id: "savings-rate-great",
                type: "savings_opportunity",
                severity: "info",
                title: "Excellent savings rate! 🎉",
                description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the great work!`,
                created: now,
            });
        }

        // 3. Category Trend Insights
        const topCategory = Array.from(categoryTotals.entries())
            .sort((a, b) => b[1].current - a[1].current)[0];

        if (topCategory && topCategory[1].current > 0) {
            const percentage = stats.monthlyExpenses > 0
                ? (topCategory[1].current / stats.monthlyExpenses) * 100
                : 0;

            if (percentage > 40) {
                generatedInsights.push({
                    id: "top-category",
                    type: "category_trend",
                    severity: "info",
                    title: `${topCategory[0]} dominates spending`,
                    description: `${percentage.toFixed(0)}% of your expenses go to ${topCategory[0].toLowerCase()}. Consider if this aligns with your priorities.`,
                    impact: topCategory[1].current,
                    actionLabel: "Analyze Category",
                    created: now,
                });
            }
        }

        // 4. Recurring Expense Detection
        const expenseDescriptions = currentMonthTxn
            .filter(t => t.type === 'expense')
            .map(t => t.name.toLowerCase());

        const recurringKeywords = ['subscription', 'monthly', 'rent', 'insurance', 'emi', 'netflix', 'spotify'];
        const hasRecurring = expenseDescriptions.some(desc =>
            recurringKeywords.some(keyword => desc.includes(keyword))
        );

        if (hasRecurring) {
            generatedInsights.push({
                id: "recurring-detected",
                type: "bill_prediction",
                severity: "info",
                title: "Recurring expenses detected",
                description: "We noticed subscriptions and recurring bills in your transactions. Track them separately for better budgeting.",
                actionLabel: "Manage Subscriptions",
                created: now,
            });
        }

        // 5. Goal Recommendation
        if (stats.savings > 0 && stats.savings > stats.monthlyExpenses * 2) {
            generatedInsights.push({
                id: "goal-rec-invest",
                type: "goal_recommendation",
                severity: "info",
                title: "Ready to invest?",
                description: `You have ₹${stats.savings.toLocaleString()} in savings this month. Consider setting investment goals to grow your wealth.`,
                actionLabel: "Create Goal",
                created: now,
            });
        }

        return generatedInsights;
    }, [transactions, stats]);

    const filteredInsights = useMemo(() => {
        if (activeTab === "all") return insights;
        return insights.filter(i => i.type === activeTab);
    }, [insights, activeTab]);

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "critical":
                return <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">Critical</span>;
            case "warning":
                return <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium">Warning</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Info</span>;
        }
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Financial Insights</h1>
                            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                                <Brain className="w-3 h-3" />
                                AI-Powered
                            </div>
                        </div>
                        <p className="text-muted-foreground">
                            Rule-based intelligence with real data — no hallucinations, only facts
                        </p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh Analysis
                    </Button>
                </div>

                {/* AI Philosophy Banner */}
                <Card className="glass-card bg-gradient-to-r from-primary/5 via-card to-accent/5 border-primary/20">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">CFO-Style Intelligence</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our insights are generated from <strong>rule-based analysis</strong> of your actual data —
                                    not AI predictions. Every insight is backed by real numbers you can verify.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Data-Verified
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Insight Categories */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 h-auto">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
                        >
                            All Insights ({insights.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="spending_anomaly"
                            className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground rounded-full px-4"
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Anomalies
                        </TabsTrigger>
                        <TabsTrigger
                            value="savings_opportunity"
                            className="data-[state=active]:bg-success data-[state=active]:text-success-foreground rounded-full px-4"
                        >
                            <PiggyBank className="w-4 h-4 mr-2" />
                            Savings
                        </TabsTrigger>
                        <TabsTrigger
                            value="category_trend"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Trends
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredInsights.length === 0 ? (
                            <Card className="glass-card border-dashed">
                                <CardContent className="p-12 text-center">
                                    <div className="p-4 rounded-full bg-success/10 w-fit mx-auto mb-4">
                                        <Sparkles className="w-8 h-8 text-success" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">All Clear! 🎉</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        No significant insights to report. Your finances look healthy!
                                        Keep tracking your transactions to get more personalized insights.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredInsights.map((insight, index) => {
                                    const typeConfig = insightTypes[insight.type];
                                    const Icon = typeConfig.icon;

                                    return (
                                        <Card
                                            key={insight.id}
                                            className="glass-card hover:scale-[1.01] transition-all duration-300 animate-slide-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-4">
                                                    <div className={cn("p-3 rounded-xl flex-shrink-0", typeConfig.bg)}>
                                                        <Icon className={cn("w-5 h-5", typeConfig.color)} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="font-semibold text-foreground">{insight.title}</h3>
                                                                {getSeverityBadge(insight.severity)}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-muted-foreground text-sm flex-shrink-0">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Just now</span>
                                                            </div>
                                                        </div>

                                                        <p className="text-muted-foreground text-sm mb-4">
                                                            {insight.description}
                                                        </p>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {insight.impact && (
                                                                    <div className={cn(
                                                                        "flex items-center gap-1 text-sm font-medium",
                                                                        insight.impact > 0
                                                                            ? insight.severity === "info" ? "text-success" : "text-destructive"
                                                                            : "text-success"
                                                                    )}>
                                                                        {insight.impact > 0 ? (
                                                                            <TrendingUp className="w-4 h-4" />
                                                                        ) : (
                                                                            <TrendingDown className="w-4 h-4" />
                                                                        )}
                                                                        <span>₹{Math.abs(insight.impact).toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {insight.actionLabel && (
                                                                    <Button size="sm" variant="outline" className="gap-2">
                                                                        {insight.actionLabel}
                                                                        <ArrowRight className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-success">
                                                                        <ThumbsUp className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                                        <ThumbsDown className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="glass-card">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Eye className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Analyzed</span>
                            </div>
                            <div className="text-3xl font-bold text-foreground">
                                {transactions?.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">transactions processed</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-warning/10">
                                    <AlertTriangle className="w-5 h-5 text-warning" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Action Needed</span>
                            </div>
                            <div className="text-3xl font-bold text-foreground">
                                {insights.filter(i => i.severity === "critical" || i.severity === "warning").length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">items require attention</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-success/10">
                                    <Zap className="w-5 h-5 text-success" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Potential Savings</span>
                            </div>
                            <div className="text-3xl font-bold text-success">
                                ₹{insights
                                    .filter(i => i.type === "savings_opportunity" && i.impact && i.impact > 0)
                                    .reduce((sum, i) => sum + (i.impact || 0), 0)
                                    .toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">identified opportunities</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
