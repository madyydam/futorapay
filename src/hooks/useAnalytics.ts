import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { useMemo } from "react";

import { MOCK_MONTHLY_SUMMARY, MOCK_CATEGORY_SUMMARY, GUEST_USER } from "@/lib/mock-data";

interface MonthlySummary {
    month_start: string;
    total_income: number;
    total_expense: number;
    net_savings: number;
    transaction_count: number;
}

interface CategorySummary {
    category_name: string;
    month_start: string;
    total_amount: number;
    transaction_count: number;
}

export function useAnalytics() {
    const { user, isGuest } = useAuth();
    const effectiveUser = isGuest ? GUEST_USER : user;

    const { data: monthlySummary, isLoading: monthlyLoading } = useQuery({
        queryKey: ["analytics", "monthly", effectiveUser?.id],
        queryFn: async () => {
            if (isGuest) return MOCK_MONTHLY_SUMMARY as MonthlySummary[];
            if (!user) return [];
            const { data, error } = await supabase
                .from("view_analytics_monthly_summary")
                .select("*")
                .eq("user_id", user.id)
                .order("month_start", { ascending: true })
                .limit(6);

            if (error) throw error;
            return (data as MonthlySummary[]) || [];
        },
        enabled: !!effectiveUser,
    });

    const { data: categorySummary, isLoading: categoryLoading } = useQuery({
        queryKey: ["analytics", "category", effectiveUser?.id],
        queryFn: async () => {
            if (isGuest) return MOCK_CATEGORY_SUMMARY as CategorySummary[];
            if (!user) return [];
            const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
            const { data, error } = await supabase
                .from("view_analytics_category_summary")
                .select("*")
                .eq("user_id", user.id)
                .eq("month_start", currentMonth);

            if (error) throw error;
            return (data as CategorySummary[]) || [];
        },
        enabled: !!effectiveUser,
    });

    return useMemo(() => ({
        monthlySummary,
        categorySummary,
        isLoading: monthlyLoading || categoryLoading,
    }), [monthlySummary, categorySummary, monthlyLoading, categoryLoading]);
}
