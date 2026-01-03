import { useState, memo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subscription } from "@/hooks/useSubscriptions";

interface AddSubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (subscription: Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">) => void;
    editingSubscription?: Subscription | null;
}

const iconOptions = [
    { value: "🎬", label: "Movies" },
    { value: "🎵", label: "Music" },
    { value: "📦", label: "Shopping" },
    { value: "⚡", label: "Utilities" },
    { value: "💪", label: "Fitness" },
    { value: "🎨", label: "Creative" },
    { value: "🌐", label: "Internet" },
    { value: "📱", label: "Phone" },
    { value: "💳", label: "Other" },
];

export const AddSubscriptionDialog = memo(function AddSubscriptionDialog({ open, onOpenChange, onSubmit, editingSubscription }: AddSubscriptionDialogProps) {
    const [name, setName] = useState(editingSubscription?.name || "");
    const [amount, setAmount] = useState(editingSubscription?.amount?.toString() || "");
    const [billingCycle, setBillingCycle] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
        editingSubscription?.billing_cycle || 'monthly'
    );
    const [category, setCategory] = useState(editingSubscription?.category || "");
    const [icon, setIcon] = useState(editingSubscription?.icon || "💳");
    const [nextBillingDate, setNextBillingDate] = useState(
        editingSubscription?.next_billing_date || new Date().toISOString().split('T')[0]
    );
    const [reminderDays, setReminderDays] = useState(editingSubscription?.reminder_days?.toString() || "3");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            name,
            amount: parseFloat(amount),
            currency: "INR",
            billing_cycle: billingCycle,
            next_billing_date: nextBillingDate,
            category,
            icon,
            is_active: true,
            auto_renew: true,
            reminder_days: parseInt(reminderDays),
            notifications_enabled: true,
        });

        // Reset form
        setName("");
        setAmount("");
        setBillingCycle('monthly');
        setCategory("");
        setIcon("💳");
        setNextBillingDate(new Date().toISOString().split('T')[0]);
        setReminderDays("3");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingSubscription ? 'Edit' : 'Add'} Subscription</DialogTitle>
                        <DialogDescription>
                            Track your recurring payments and never miss a bill.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Subscription Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Netflix, Spotify, etc."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="649"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Select value={icon} onValueChange={setIcon}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.value} {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                                <Select value={billingCycle} onValueChange={(v: any) => setBillingCycle(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Entertainment"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="next_billing_date">Next Billing Date *</Label>
                                <Input
                                    id="next_billing_date"
                                    type="date"
                                    value={nextBillingDate}
                                    onChange={(e) => setNextBillingDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reminder_days">Reminder (days before)</Label>
                                <Input
                                    id="reminder_days"
                                    type="number"
                                    value={reminderDays}
                                    onChange={(e) => setReminderDays(e.target.value)}
                                    min="0"
                                    max="30"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingSubscription ? 'Update' : 'Add'} Subscription
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});
