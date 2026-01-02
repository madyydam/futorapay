import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
    const { data: monthlySummary, isLoading: monthlyLoading } = useQuery({
        queryKey: ["analytics", "monthly"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("view_analytics_monthly_summary")
                .select("*")
                .order("month_start", { ascending: true })
                .limit(6);

            if (error) throw error;
            return (data as MonthlySummary[]) || [];
        },
    });

    const { data: categorySummary, isLoading: categoryLoading } = useQuery({
        queryKey: ["analytics", "category"],
        queryFn: async () => {
            const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
            const { data, error } = await supabase
                .from("view_analytics_category_summary")
                .select("*")
                .eq("month_start", currentMonth);

            if (error) throw error;
            return (data as CategorySummary[]) || [];
        },
    });

    return {
        monthlySummary,
        categorySummary,
        isLoading: monthlyLoading || categoryLoading,
    };
}
