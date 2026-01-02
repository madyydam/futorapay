import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAccounts, AccountType } from "@/hooks/useAccounts";
import { useAuth } from "@/components/auth/AuthProvider";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["bank", "cash", "credit", "investment", "loan"] as [AccountType, ...AccountType[]]),
    opening_balance: z.string().refine((val) => !isNaN(Number(val)), {
        message: "Balance must be a number",
    }),
    currency: z.string().default("INR"),
});

export function AddAccountDialog() {
    const [open, setOpen] = useState(false);
    const { createAccount } = useAccounts();
    const { user } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "bank",
            opening_balance: "0",
            currency: "INR",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            console.error("User not authenticated");
            return;
        }

        createAccount.mutate(
            {
                name: values.name,
                type: values.type,
                opening_balance: Number(values.opening_balance),
                currency: values.currency,
                user_id: user.id,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    form.reset();
                },
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Account</DialogTitle>
                    <DialogDescription>
                        Add a new account to track your assets or liabilities manually.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. HDFC Salary" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="bank">Bank Account</SelectItem>
                                            <SelectItem value="cash">Cash Wallet</SelectItem>
                                            <SelectItem value="credit">Credit Card</SelectItem>
                                            <SelectItem value="investment">Investment</SelectItem>
                                            <SelectItem value="loan">Loan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="opening_balance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Opening Balance</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={createAccount.isPending}>
                            {createAccount.isPending ? "Creating..." : "Create Account"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
