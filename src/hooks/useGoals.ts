import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

    const { data: goals = [], isLoading, error } = useQuery({
        queryKey: ["goals"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("goals")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Goal[];
        },
    });

    const addGoal = useMutation({
        mutationFn: async (newGoal: Omit<Goal, "id" | "user_id" | "created_at" | "current_amount">) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("goals")
                .insert([{ ...newGoal, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            toast.success("Savings goal created!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create goal");
        },
    });

    const updateGoal = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Goal> & { id: string }) => {
            const { data, error } = await supabase
                .from("goals")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            toast.success("Goal updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update goal");
        },
    });

    const addSavings = useMutation({
        mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
            // first get current amount
            const goal = goals.find(g => g.id === id);
            if (!goal) throw new Error("Goal not found");

            const newAmount = Number(goal.current_amount) + Number(amount);

            const { data, error } = await supabase
                .from("goals")
                .update({ current_amount: newAmount })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            toast.success("Added savings to goal!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add savings");
        }
    });

    const deleteGoal = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("goals").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            toast.success("Goal deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete goal");
        },
    });

    return {
        goals,
        isLoading,
        error,
        addGoal,
        updateGoal,
        addSavings,
        deleteGoal,
    };
}
