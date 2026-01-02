import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { Loader2, Plus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be greater than 0"),
    category: z.string().min(1, "Category is required"),
    date: z.string().min(1, "Date is required"),
    payment_method: z.string().min(1, "Payment method is required"),
});

interface AddTransactionDialogProps {
    type: 'income' | 'expense';
    categories: string[];
}

export function AddTransactionDialog({ type, categories }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const { addTransaction } = useTransactions();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            amount: "",
            category: "",
            date: new Date().toISOString().split('T')[0],
            payment_method: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await addTransaction.mutateAsync({
                name: values.name,
                amount: Number(values.amount),
                type,
                category: values.category.toLowerCase(), // Store lowercase for consistency
                date: values.date,
                payment_method: values.payment_method,
                notes: "",
            });
            form.reset();
            setOpen(false);
        } catch (error) {
            console.error("Failed to add transaction", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Add {type === 'income' ? 'Income' : 'Expense'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card-elevated border-border">
                <DialogHeader>
                    <DialogTitle>Add {type === 'income' ? 'Income' : 'Expense'}</DialogTitle>
                    <DialogDescription>
                        Enter the details of your new transaction.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Grocery Shopping" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="UPI">UPI</SelectItem>
                                                <SelectItem value="Card">Card</SelectItem>
                                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={addTransaction.isPending}>
                                {addTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Transaction
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
