import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Power,
    PowerOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { AddSubscriptionDialog } from "@/components/subscriptions/AddSubscriptionDialog";

const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Subscriptions() {
    const { subscriptions, isLoading, addSubscription, updateSubscription, deleteSubscription, toggleSubscription } = useSubscriptions();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<any>(null);

    const calculations = useMemo(() => {
        const activeSubscriptions = subscriptions.filter(s => s.is_active);

        const totalMonthly = activeSubscriptions
            .filter(s => s.billing_cycle === 'monthly')
            .reduce((sum, sub) => sum + Number(sub.amount), 0);

        const upcomingBills = [...activeSubscriptions]
            .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime())
            .slice(0, 5);

        const dueThisWeek = activeSubscriptions.filter(s => getDaysUntil(s.next_billing_date) <= 7);
        const dueThisWeekTotal = dueThisWeek.reduce((sum, s) => sum + Number(s.amount), 0);

        return {
            activeSubscriptions,
            totalMonthly,
            upcomingBills,
            dueThisWeek,
            dueThisWeekTotal
        };
    }, [subscriptions]);

    const { activeSubscriptions, totalMonthly, upcomingBills, dueThisWeek, dueThisWeekTotal } = calculations;

    const handleAdd = () => {
        setEditingSubscription(null);
        setDialogOpen(true);
    };

    const handleEdit = (subscription: any) => {
        setEditingSubscription(subscription);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this subscription?")) {
            deleteSubscription.mutate(id);
        }
    };

    const handleToggle = (id: string, currentStatus: boolean) => {
        toggleSubscription.mutate({ id, is_active: !currentStatus });
    };

    const handleSubmit = (data: any) => {
        if (editingSubscription) {
            updateSubscription.mutate({ id: editingSubscription.id, ...data });
        } else {
            addSubscription.mutate(data);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-4 lg:p-8 flex items-center justify-center min-h-screen">
                    <div className="text-muted-foreground">Loading subscriptions...</div>
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
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Recurring Payments</h1>
                        <p className="text-muted-foreground">
                            Track and manage your subscriptions and recurring bills
                        </p>
                    </div>
                    <Button className="gap-2" onClick={handleAdd}>
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
                            <p className="text-xs text-muted-foreground mt-1">{activeSubscriptions.length} active subscriptions</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-warning">₹ {dueThisWeekTotal.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">{dueThisWeek.length} payments</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{subscriptions.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {subscriptions.length - activeSubscriptions.length} inactive
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Bills Calendar */}
                {upcomingBills.length > 0 && (
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
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {upcomingBills.map((sub) => {
                                const daysUntil = getDaysUntil(sub.next_billing_date);
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
                                                <div className="text-2xl">{sub.icon || '💳'}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-foreground">{sub.name}</h4>
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {sub.billing_cycle}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm text-muted-foreground">
                                                            Due {new Date(sub.next_billing_date).toLocaleDateString('en-IN', {
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
                                                <div className="text-lg font-bold text-foreground">₹ {Number(sub.amount).toLocaleString()}</div>
                                                <span className="text-xs text-muted-foreground">{sub.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* All Subscriptions */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>All Subscriptions</CardTitle>
                        <CardDescription>Manage your recurring payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subscriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">No Subscriptions Yet</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                                    Start tracking your recurring payments to never miss a bill.
                                </p>
                                <Button onClick={handleAdd}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Subscription
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subscriptions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className={cn(
                                            "p-4 rounded-lg border transition-all",
                                            sub.is_active
                                                ? "border-border bg-secondary/10 hover:bg-secondary/20"
                                                : "border-border bg-secondary/5 opacity-60"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="text-3xl">{sub.icon || '💳'}</div>
                                            <div className="flex items-center gap-1">
                                                <Badge
                                                    variant={sub.is_active ? "outline" : "secondary"}
                                                    className="gap-1"
                                                >
                                                    {sub.is_active ? (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    ) : (
                                                        <AlertCircle className="w-3 h-3" />
                                                    )}
                                                    {sub.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(sub)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggle(sub.id, sub.is_active)}>
                                                            {sub.is_active ? (
                                                                <>
                                                                    <PowerOff className="w-4 h-4 mr-2" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="w-4 h-4 mr-2" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(sub.id)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">{sub.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-2">{sub.category || 'Other'}</p>
                                        <div className="flex items-center justify-between pt-2 border-t border-border">
                                            <div>
                                                <div className="text-lg font-bold text-foreground">₹ {Number(sub.amount).toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground capitalize">{sub.billing_cycle}</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground text-right">
                                                Next: {new Date(sub.next_billing_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <AddSubscriptionDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    editingSubscription={editingSubscription}
                />
            </div>
        </DashboardLayout>
    );
}
