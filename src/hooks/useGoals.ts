import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useMemo } from "react";

import { MOCK_GOALS, GUEST_USER } from "@/lib/mock-data";

export interface Goal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    icon: string;
    deadline: string;
    color: string;
    created_at: string;
}

export function useGoals() {
    const queryClient = useQueryClient();
    const { user, isGuest } = useAuth();
    const effectiveUser = isGuest ? GUEST_USER : user;

    const { data: goals = [], isLoading, error } = useQuery({
        queryKey: ["goals", effectiveUser?.id],
        queryFn: async () => {
            if (isGuest) return MOCK_GOALS;
            if (!user) return [];
            const { data, error } = await supabase
                .from("goals")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Goal[];
        },
        enabled: !!effectiveUser,
    });

    const addGoal = useMutation({
        mutationFn: async (newGoal: Omit<Goal, "id" | "user_id" | "created_at" | "current_amount">) => {
            if (isGuest) {
                toast.error("Demo mode: Cannot add goals");
                return null;
            }
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("goals")
                .insert([{ ...newGoal, user_id: user.id, current_amount: 0 }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
            toast.success("Savings goal created!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create goal");
        },
    });

    const updateGoal = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Goal> & { id: string }) => {
            if (isGuest) {
                toast.error("Demo mode: Cannot update goals");
                return null;
            }
            const { data, error } = await supabase
                .from("goals")
                .update(updates)
                .eq("id", id)
                .eq("user_id", user?.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
            toast.success("Goal updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update goal");
        },
    });

    const addSavings = useMutation({
        mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
            if (isGuest) {
                toast.error("Demo mode: Cannot add savings");
                return null;
            }
            const goal = goals.find(g => g.id === id);
            if (!goal) throw new Error("Goal not found");

            const newAmount = Number(goal.current_amount) + Number(amount);

            const { data, error } = await supabase
                .from("goals")
                .update({ current_amount: newAmount })
                .eq("id", id)
                .eq("user_id", user?.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
            toast.success("Added savings to goal!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add savings");
        }
    });

    const deleteGoal = useMutation({
        mutationFn: async (id: string) => {
            if (isGuest) {
                toast.error("Demo mode: Cannot delete goals");
                return null;
            }
            const { error } = await supabase
                .from("goals")
                .delete()
                .eq("id", id)
                .eq("user_id", user?.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
            toast.success("Goal deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete goal");
        },
    });

    return useMemo(() => ({
        goals,
        isLoading,
        error,
        addGoal,
        updateGoal,
        addSavings,
        deleteGoal,
    }), [goals, isLoading, error, addGoal, updateGoal, addSavings, deleteGoal]);
}
