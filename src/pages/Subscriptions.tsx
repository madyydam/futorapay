import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    CreditCard,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const subscriptions = [
    {
        id: 1,
        name: "Netflix",
        amount: 649,
        frequency: "monthly",
        nextDate: "2026-01-15",
        category: "Entertainment",
        status: "active",
        icon: "🎬"
    },
    {
        id: 2,
        name: "Spotify Premium",
        amount: 119,
        frequency: "monthly",
        nextDate: "2026-01-10",
        category: "Entertainment",
        status: "active",
        icon: "🎵"
    },
    {
        id: 3,
        name: "Amazon Prime",
        amount: 299,
        frequency: "monthly",
        nextDate: "2026-01-22",
        category: "Shopping",
        status: "active",
        icon: "📦"
    },
    {
        id: 4,
        name: "Electricity Bill",
        amount: 2800,
        frequency: "monthly",
        nextDate: "2026-01-05",
        category: "Bills",
        status: "due_soon",
        icon: "⚡"
    },
    {
        id: 5,
        name: "Gym Membership",
        amount: 1500,
        frequency: "monthly",
        nextDate: "2026-01-20",
        category: "Healthcare",
        status: "active",
        icon: "💪"
    },
    {
        id: 6,
        name: "Adobe Creative Cloud",
        amount: 1899,
        frequency: "monthly",
        nextDate: "2026-01-08",
        category: "Work",
        status: "active",
        icon: "🎨"
    },
];

const upcomingBills = subscriptions
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
    .slice(0, 5);

const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Subscriptions() {
    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in">
                    <div className="space-y-1">
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Recurring Payments</h1>
                        <p className="text-muted-foreground">
                            Track and manage your subscriptions and recurring bills
                        </p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Subscription
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Monthly Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">₹ {totalMonthly.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">{subscriptions.length} active subscriptions</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-warning">
                                ₹ {upcomingBills
                                    .filter(s => getDaysUntil(s.nextDate) <= 7)
                                    .reduce((sum, s) => sum + s.amount, 0)
                                    .toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {upcomingBills.filter(s => getDaysUntil(s.nextDate) <= 7).length} payments
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Potential</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">₹ 1,768</div>
                            <p className="text-xs text-muted-foreground mt-1">By reviewing unused services</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Bills Calendar */}
                <Card className="glass-card-elevated">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Upcoming Bills
                                </CardTitle>
                                <CardDescription>Next 30 days</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {upcomingBills.map((sub) => {
                            const daysUntil = getDaysUntil(sub.nextDate);
                            const isDueSoon = daysUntil <= 3;

                            return (
                                <div
                                    key={sub.id}
                                    className={cn(
                                        "p-4 rounded-lg border transition-all hover:bg-secondary/30",
                                        isDueSoon ? "border-warning/30 bg-warning/5" : "border-border bg-secondary/10"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="text-2xl">{sub.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-foreground">{sub.name}</h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {sub.frequency}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-sm text-muted-foreground">
                                                        Due {new Date(sub.nextDate).toLocaleDateString('en-IN', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <Badge
                                                        variant={isDueSoon ? "destructive" : "secondary"}
                                                        className="text-xs gap-1"
                                                    >
                                                        {isDueSoon ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil} days`}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-foreground">₹ {sub.amount}</div>
                                            <span className="text-xs text-muted-foreground">{sub.category}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* All Subscriptions */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>All Subscriptions</CardTitle>
                        <CardDescription>Manage your recurring payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subscriptions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="p-4 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/20 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-3xl">{sub.icon}</div>
                                        <Badge
                                            variant={sub.status === "active" ? "outline" : "destructive"}
                                            className="gap-1"
                                        >
                                            {sub.status === "active" ? (
                                                <CheckCircle2 className="w-3 h-3" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3" />
                                            )}
                                            {sub.status === "active" ? "Active" : "Due Soon"}
                                        </Badge>
                                    </div>
                                    <h4 className="font-semibold text-foreground mb-1">{sub.name}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">{sub.category}</p>
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <div>
                                            <div className="text-lg font-bold text-foreground">₹ {sub.amount}</div>
                                            <div className="text-xs text-muted-foreground capitalize">{sub.frequency}</div>
                                        </div>
                                        <Button variant="ghost" size="sm">Manage</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
