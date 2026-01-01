import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

    const { data: transactions, isLoading, error } = useQuery({
        queryKey: ["transactions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .order("date", { ascending: false });

            if (error) throw error;
            return data as Transaction[];
        },
    });

    const addTransaction = useMutation({
        mutationFn: async (newTransaction: Omit<Transaction, "id" | "user_id" | "created_at">) => {
            const { data: { user } } = await supabase.auth.getUser();
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
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            toast.success("Transaction updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update transaction");
        },
    });

    const deleteTransaction = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("transactions").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            toast.success("Transaction deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete transaction");
        },
    });

    return {
        transactions,
        isLoading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
    };
}
