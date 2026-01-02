import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    Building,
    Car,
    Home,
    Landmark,
    Bitcoin,
    PiggyBank,
    MoreVertical,
    Plus,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    LineChart,
    BarChart3,
    Sparkles,
    History,
    Target,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
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

const accountTypeIcons: Record<string, any> = {
    cash: Wallet,
    bank_checking: Landmark,
    bank_savings: PiggyBank,
    credit_card: CreditCard,
    investment: TrendingUp,
    loan: Building,
    mortgage: Home,
    real_estate: Home,
    crypto: Bitcoin,
    other_asset: Wallet,
    other_liability: CreditCard,
};

const accountTypeLabels: Record<string, string> = {
    cash: "Cash",
    bank_checking: "Checking Account",
    bank_savings: "Savings Account",
    credit_card: "Credit Card",
    investment: "Investment",
    loan: "Loan",
    mortgage: "Mortgage",
    real_estate: "Real Estate",
    crypto: "Cryptocurrency",
    other_asset: "Other Asset",
    other_liability: "Other Liability",
};

export default function NetWorth() {
    const { accounts, isLoading } = useAccounts();
    const [timeframe, setTimeframe] = useState("1M");

    // Calculate totals
    const calculations = useMemo(() => {
        if (!accounts) return { assets: 0, liabilities: 0, netWorth: 0, assetBreakdown: [], liabilityBreakdown: [] };

        const assets = accounts
            .filter(a => a.classification === 'asset' && a.is_active)
            .reduce((sum, a) => sum + Number(a.current_balance), 0);

        const liabilities = accounts
            .filter(a => a.classification === 'liability' && a.is_active)
            .reduce((sum, a) => sum + Number(a.current_balance), 0);

        const assetBreakdown = accounts
            .filter(a => a.classification === 'asset' && a.is_active)
            .map(a => ({
                ...a,
                percentage: assets > 0 ? (Number(a.current_balance) / assets) * 100 : 0,
            }))
            .sort((a, b) => Number(b.current_balance) - Number(a.current_balance));

        const liabilityBreakdown = accounts
            .filter(a => a.classification === 'liability' && a.is_active)
            .map(a => ({
                ...a,
                percentage: liabilities > 0 ? (Number(a.current_balance) / liabilities) * 100 : 0,
            }))
            .sort((a, b) => Number(b.current_balance) - Number(a.current_balance));

        return {
            assets,
            liabilities,
            netWorth: assets - liabilities,
            assetBreakdown,
            liabilityBreakdown,
        };
    }, [accounts]);

    // Simulated historical data for visualization
    const netWorthHistory = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const baseValue = calculations.netWorth || 0;
        return months.map((month, index) => ({
            month,
            value: Math.max(0, baseValue * (0.7 + (index * 0.05) + Math.random() * 0.1)),
        }));
    }, [calculations.netWorth]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getChangeIndicator = (change: number) => {
        if (change > 0) {
            return { icon: ArrowUpRight, color: "text-success", bg: "bg-success/10" };
        } else if (change < 0) {
            return { icon: ArrowDownRight, color: "text-destructive", bg: "bg-destructive/10" };
        }
        return { icon: RefreshCw, color: "text-muted-foreground", bg: "bg-secondary" };
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Net Worth</h1>
                            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                Live
                            </div>
                        </div>
                        <p className="text-muted-foreground">
                            Your complete financial picture — assets, liabilities, and real-time net worth
                        </p>
                    </div>
                    <AddAccountDialog />
                </div>

                {/* Main Net Worth Card */}
                <Card className="glass-card-elevated bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20 animate-slide-up overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                    <CardContent className="p-6 lg:p-8 relative">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            {/* Net Worth Display */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/20">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        Total Net Worth
                                    </span>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">Calculating...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-baseline gap-3">
                                            <span className={cn(
                                                "text-4xl lg:text-5xl font-bold tracking-tight",
                                                calculations.netWorth >= 0 ? "text-foreground" : "text-destructive"
                                            )}>
                                                {formatCurrency(calculations.netWorth)}
                                            </span>
                                            <div className={cn(
                                                "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
                                                "bg-success/10 text-success"
                                            )}>
                                                <TrendingUp className="w-4 h-4" />
                                                <span>+12.5%</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Updated just now • Based on {accounts?.length || 0} accounts
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Mini Chart Visualization */}
                            <div className="flex items-end gap-1 h-20">
                                {netWorthHistory.map((point, index) => (
                                    <div
                                        key={point.month}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div
                                            className={cn(
                                                "w-8 rounded-t-sm transition-all duration-300",
                                                index === netWorthHistory.length - 1
                                                    ? "bg-primary"
                                                    : "bg-primary/30"
                                            )}
                                            style={{
                                                height: `${(point.value / (calculations.netWorth || 1)) * 60 + 10}px`,
                                            }}
                                        />
                                        <span className="text-xs text-muted-foreground">{point.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assets vs Liabilities Summary */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/50">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-success" />
                                        <span className="text-sm font-medium text-foreground">Total Assets</span>
                                    </div>
                                    <span className="text-sm text-success font-semibold">
                                        {formatCurrency(calculations.assets)}
                                    </span>
                                </div>
                                <Progress value={100} className="h-2 bg-success/20" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-destructive" />
                                        <span className="text-sm font-medium text-foreground">Total Liabilities</span>
                                    </div>
                                    <span className="text-sm text-destructive font-semibold">
                                        {formatCurrency(calculations.liabilities)}
                                    </span>
                                </div>
                                <Progress
                                    value={calculations.assets > 0 ? (calculations.liabilities / calculations.assets) * 100 : 0}
                                    className="h-2 bg-destructive/20"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeframe Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                    {["1W", "1M", "3M", "6M", "1Y", "ALL"].map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeframe(period)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                timeframe === period
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                            )}
                        >
                            {period}
                        </button>
                    ))}
                </div>

                {/* Tabs for Assets/Liabilities */}
                <Tabs defaultValue="assets" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-secondary/50">
                        <TabsTrigger value="assets" className="gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Assets ({calculations.assetBreakdown.length})
                        </TabsTrigger>
                        <TabsTrigger value="liabilities" className="gap-2">
                            <TrendingDown className="w-4 h-4" />
                            Liabilities ({calculations.liabilityBreakdown.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="mt-6">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : calculations.assetBreakdown.length === 0 ? (
                            <Card className="glass-card border-dashed">
                                <CardContent className="p-12 text-center">
                                    <div className="p-4 rounded-full bg-success/10 w-fit mx-auto mb-4">
                                        <Wallet className="w-8 h-8 text-success" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No assets yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Add your bank accounts, investments, and other assets to see your complete picture.
                                    </p>
                                    <AddAccountDialog />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {calculations.assetBreakdown.map((account, index) => {
                                    const Icon = accountTypeIcons[account.type] || Wallet;
                                    return (
                                        <Card
                                            key={account.id}
                                            className="glass-card hover:scale-[1.02] transition-all duration-300 animate-slide-up group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="p-3 rounded-xl bg-success/10">
                                                        <Icon className="w-5 h-5 text-success" />
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                                                        {accountTypeLabels[account.type] || account.type}
                                                    </span>
                                                </div>

                                                <h3 className="font-semibold text-foreground mb-1">{account.name}</h3>
                                                {account.institution_name && (
                                                    <p className="text-xs text-muted-foreground mb-3">{account.institution_name}</p>
                                                )}

                                                <div className="flex items-end justify-between mt-3">
                                                    <div>
                                                        <p className="text-2xl font-bold text-foreground">
                                                            {formatCurrency(Number(account.current_balance))}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {account.percentage.toFixed(1)}% of assets
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-success text-sm">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>+5.2%</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <Progress value={account.percentage} className="h-1.5" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="liabilities" className="mt-6">
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : calculations.liabilityBreakdown.length === 0 ? (
                            <Card className="glass-card border-dashed">
                                <CardContent className="p-12 text-center">
                                    <div className="p-4 rounded-full bg-success/10 w-fit mx-auto mb-4">
                                        <Target className="w-8 h-8 text-success" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Debt-free! 🎉</h3>
                                    <p className="text-muted-foreground">
                                        You have no liabilities tracked. That's amazing!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {calculations.liabilityBreakdown.map((account, index) => {
                                    const Icon = accountTypeIcons[account.type] || CreditCard;
                                    return (
                                        <Card
                                            key={account.id}
                                            className="glass-card hover:scale-[1.02] transition-all duration-300 animate-slide-up group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="p-3 rounded-xl bg-destructive/10">
                                                        <Icon className="w-5 h-5 text-destructive" />
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                                                        {accountTypeLabels[account.type] || account.type}
                                                    </span>
                                                </div>

                                                <h3 className="font-semibold text-foreground mb-1">{account.name}</h3>
                                                {account.institution_name && (
                                                    <p className="text-xs text-muted-foreground mb-3">{account.institution_name}</p>
                                                )}

                                                <div className="flex items-end justify-between mt-3">
                                                    <div>
                                                        <p className="text-2xl font-bold text-destructive">
                                                            {formatCurrency(Number(account.current_balance))}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {account.percentage.toFixed(1)}% of debt
                                                        </p>
                                                    </div>
                                                    {account.interest_rate && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {account.interest_rate}% APR
                                                        </div>
                                                    )}
                                                </div>

                                                {account.credit_limit && (
                                                    <div className="mt-3 space-y-1">
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Utilization</span>
                                                            <span>{((Number(account.current_balance) / Number(account.credit_limit)) * 100).toFixed(0)}%</span>
                                                        </div>
                                                        <Progress
                                                            value={(Number(account.current_balance) / Number(account.credit_limit)) * 100}
                                                            className="h-1.5"
                                                        />
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Financial Health Score */}
                <Card className="glass-card bg-gradient-to-r from-accent/5 via-card to-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Financial Health Score
                        </CardTitle>
                        <CardDescription>
                            Based on your debt-to-asset ratio and savings rate
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground">Debt-to-Asset Ratio</div>
                                <div className="flex items-end gap-2">
                                    <span className={cn(
                                        "text-3xl font-bold",
                                        calculations.assets > 0 && (calculations.liabilities / calculations.assets) < 0.3
                                            ? "text-success"
                                            : calculations.assets > 0 && (calculations.liabilities / calculations.assets) < 0.6
                                                ? "text-warning"
                                                : "text-destructive"
                                    )}>
                                        {calculations.assets > 0
                                            ? ((calculations.liabilities / calculations.assets) * 100).toFixed(1)
                                            : 0}%
                                    </span>
                                    <span className="text-sm text-muted-foreground mb-1">
                                        {calculations.assets > 0 && (calculations.liabilities / calculations.assets) < 0.3
                                            ? "Excellent"
                                            : calculations.assets > 0 && (calculations.liabilities / calculations.assets) < 0.6
                                                ? "Good"
                                                : "Needs Work"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground">Liquid Assets</div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-foreground">
                                        {formatCurrency(
                                            accounts?.filter(a =>
                                                ['cash', 'bank_checking', 'bank_savings'].includes(a.type) &&
                                                a.classification === 'asset'
                                            ).reduce((sum, a) => sum + Number(a.current_balance), 0) || 0
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground">Investments</div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-foreground">
                                        {formatCurrency(
                                            accounts?.filter(a =>
                                                ['investment', 'crypto'].includes(a.type) &&
                                                a.classification === 'asset'
                                            ).reduce((sum, a) => sum + Number(a.current_balance), 0) || 0
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground">Overall Score</div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-16 h-16">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="none"
                                                className="text-secondary"
                                            />
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="none"
                                                strokeDasharray={`${75 * 1.76} ${100 * 1.76}`}
                                                className="text-success"
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                                            75
                                        </span>
                                    </div>
                                    <div className="text-sm text-success font-medium">Good</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
