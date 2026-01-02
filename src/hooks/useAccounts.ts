
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type AccountType =
    | "cash"
    | "bank_checking"
    | "bank_savings"
    | "credit_card"
    | "investment"
    | "loan"
    | "mortgage"
    | "real_estate"
    | "crypto"
    | "other_asset"
    | "other_liability";

export interface Account {
    id: string;
    workspace_id: string;
    user_id: string;
    name: string;
    type: AccountType;
    current_balance: number;
    currency: string;
    // Metadata
    account_number?: string; // Last 4 digits
    institution_name?: string;
    icon?: string;
    color?: string;
    // Classification
    classification: 'asset' | 'liability';
    // Interest & Limits
    interest_rate?: number;
    credit_limit?: number;
    // Status
    is_active: boolean;
    is_included_in_networth: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export type NewAccount = Pick<Account, "name" | "type" | "current_balance" | "currency" | "classification"> & {
    user_id?: string; // Optional because we might inject it
    institution_name?: string;
};

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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // Fetch the default workspace for the user (assuming single workspace for now)
            const { data: workspace } = await supabase
                .from('workspaces')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            const payload = {
                name: newAccount.name,
                type: newAccount.type,
                current_balance: newAccount.current_balance,
                currency: newAccount.currency,
                user_id: user.id,
                workspace_id: workspace?.id, // Will fail if no workspace, but good for now to fail fast
                classification: newAccount.classification,
                institution_name: newAccount.institution_name
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
