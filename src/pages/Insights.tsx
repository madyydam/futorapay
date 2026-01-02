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
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const insights = [
    {
        id: 1,
        type: "spending_anomaly",
        severity: "warning",
        title: "Unusual Shopping Spend",
        description: "You spent ₹18,500 on Shopping this month, which is 145% higher than your average.",
        impact: -5500,
        actionable: true,
        dismissed: false,
        category: "Shopping",
        date: "2026-01-02"
    },
    {
        id: 2,
        type: "savings_opportunity",
        severity: "info",
        title: "Potential Monthly Savings",
        description: "By reducing dining out by 30%, you could save an additional ₹4,200/month.",
        impact: 4200,
        actionable: true,
        dismissed: false,
        category: "Food & Dining",
        date: "2026-01-02"
    },
    {
        id: 3,
        type: "goal_recommendation",
        severity: "info",
        title: "On Track to Reach Goal",
        description: "Your Emergency Fund goal is progressing well. You're ahead by 12% of your target timeline.",
        impact: 15000,
        actionable: false,
        dismissed: false,
        category: null,
        date: "2026-01-01"
    },
    {
        id: 4,
        type: "cash_flow_warning",
        severity: "critical",
        title: "High Expense Month Ahead",
        description: "Based on your recurring bills, next month will have ₹8,000 more expenses than usual.",
        impact: -8000,
        actionable: true,
        dismissed: false,
        category: "Bills",
        date: "2025-12-30"
    },
    {
        id: 5,
        type: "category_trend",
        severity: "info",
        title: "Entertainment Spending Trend",
        description: "Your entertainment expenses have decreased by 20% over the last 3 months. Great job!",
        impact: 2500,
        actionable: false,
        dismissed: false,
        category: "Entertainment",
        date: "2025-12-28"
    },
];

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
    const handleDismiss = (id: number) => {
        toast.success("Insight dismissed");
    };

    const handleAction = (insight: typeof insights[0]) => {
        toast.info(`Taking action on: ${insight.title}`);
    };

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
                            Smart recommendations powered by your spending patterns
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
                            <div className="text-2xl font-bold text-success">₹ 6,700</div>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Anomalies Detected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-warning">3</div>
                            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Goals on Track</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">5/6</div>
                            <p className="text-xs text-muted-foreground mt-1">Great progress</p>
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
                                Keep tracking your transactions. Our AI will analyze your spending patterns and provide personalized insights.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
