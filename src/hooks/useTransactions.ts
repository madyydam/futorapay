import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useMemo } from "react";

export interface Transaction {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    payment_method: string;
    notes?: string;
    created_at: string;
}

export function useTransactions() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: transactions, isLoading, error } = useQuery({
        queryKey: ["transactions", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: false });

            if (error) throw error;
            return data as Transaction[];
        },
        enabled: !!user,
    });

    const addTransaction = useMutation({
        mutationFn: async (newTransaction: Omit<Transaction, "id" | "user_id" | "created_at">) => {
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("transactions")
                .insert([{ ...newTransaction, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
            toast.success("Transaction added successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add transaction");
        },
    });

    const updateTransaction = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
            const { data, error } = await supabase
                .from("transactions")
                .update(updates)
                .eq("id", id)
                .eq("user_id", user?.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
            toast.success("Transaction updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update transaction");
        },
    });

    const deleteTransaction = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("transactions")
                .delete()
                .eq("id", id)
                .eq("user_id", user?.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
            toast.success("Transaction deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete transaction");
        },
    });

    return useMemo(() => ({
        transactions,
        isLoading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
    }), [transactions, isLoading, error, addTransaction, updateTransaction, deleteTransaction]);
}
