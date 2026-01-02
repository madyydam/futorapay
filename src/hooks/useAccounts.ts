
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type AccountType = "bank" | "cash" | "credit" | "investment" | "loan";

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: AccountType;
    currency: string;
    opening_balance: number;
    current_balance: number;
    is_active: boolean;
    created_at: string;
}

export type NewAccount = Pick<Account, "name" | "type" | "opening_balance" | "currency" | "user_id">;

export function useAccounts() {
    const queryClient = useQueryClient();

    const { data: accounts, isLoading, error } = useQuery({
        queryKey: ["accounts"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("accounts")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as Account[];
        },
    });

    const createAccount = useMutation({
        mutationFn: async (newAccount: NewAccount) => {
            // For initial version, current_balance = opening_balance
            const payload = {
                name: newAccount.name,
                type: newAccount.type,
                opening_balance: newAccount.opening_balance,
                current_balance: newAccount.opening_balance,
                currency: newAccount.currency,
                user_id: newAccount.user_id,
            };

            const { data, error } = await supabase
                .from("accounts")
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Account created successfully");
        },
        onError: (error) => {
            console.error("Error creating account:", error);
            toast.error("Failed to create account");
        },
    });

    const deleteAccount = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("accounts").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Account deleted");
        },
        onError: (error) => {
            toast.error("Failed to delete account");
        },
    });

    return {
        accounts,
        isLoading,
        error,
        createAccount,
        deleteAccount,
    };
}
