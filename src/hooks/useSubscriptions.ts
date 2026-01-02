import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Subscription {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    currency: string;
    billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
    billing_day?: number;
    next_billing_date: string;
    category?: string;
    icon?: string;
    payment_method?: string;
    is_active: boolean;
    auto_renew: boolean;
    reminder_days: number;
    notifications_enabled: boolean;
    notes?: string;
    website_url?: string;
    created_at: string;
    updated_at: string;
}

export function useSubscriptions() {
    const queryClient = useQueryClient();

    const { data: subscriptions, isLoading, error } = useQuery({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("subscriptions")
                .select("*")
                .order("next_billing_date", { ascending: true });

            if (error) throw error;
            return data as Subscription[];
        },
    });

    const addSubscription = useMutation({
        mutationFn: async (newSub: Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("subscriptions")
                .insert([{ ...newSub, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            toast.success("Subscription added successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add subscription");
        },
    });

    const updateSubscription = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
            const { data, error } = await supabase
                .from("subscriptions")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            toast.success("Subscription updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update subscription");
        },
    });

    const deleteSubscription = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("subscriptions").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            toast.success("Subscription deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete subscription");
        },
    });

    const toggleSubscription = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await supabase
                .from("subscriptions")
                .update({ is_active })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            toast.success("Subscription status updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update subscription");
        },
    });

    return {
        subscriptions: subscriptions || [],
        isLoading,
        error,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleSubscription,
    };
}
