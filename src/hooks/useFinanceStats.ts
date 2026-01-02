import { useTransactions } from "./useTransactions";
import { useMemo } from "react";

export function useFinanceStats() {
    const { transactions, isLoading } = useTransactions();

    const stats = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return {
                totalBalance: 0,
                balanceChange: 0,
                monthlyIncome: 0,
                incomeChange: 0,
                monthlyExpenses: 0,
                expensesChange: 0,
                savings: 0,
                savingsChange: 0,
            };
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Helper to get totals for a specific month/year
        const getMonthTotals = (month: number, year: number) => {
            const monthTransactions = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return { income, expense, balance: income - expense };
        };

        const current = getMonthTotals(currentMonth, currentYear);
        const previous = getMonthTotals(lastMonth, lastMonthYear);

        // Calculate All-Time Balance
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalBalance = totalIncome - totalExpenses;

        const calculateChange = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        return {
            totalBalance,
            balanceChange: calculateChange(current.balance, previous.balance),
            monthlyIncome: current.income,
            incomeChange: calculateChange(current.income, previous.income),
            monthlyExpenses: current.expense,
            expensesChange: calculateChange(current.expense, previous.expense),
            savings: current.balance,
            savingsChange: calculateChange(current.balance, previous.balance),
        };
    }, [transactions]);

    return useMemo(() => ({
        stats,
        loading: isLoading,
    }), [stats, isLoading]);
}
