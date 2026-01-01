import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo, memo } from "react";
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns";

export const SpendingChart = memo(function SpendingChart() {
  const { transactions, isLoading } = useTransactions();

  const chartData = useMemo(() => {
    if (!transactions) return [];

    // Last 6 months
    const months = Array.from({ length: 6 }).map((_, i) => subMonths(startOfMonth(new Date()), 5 - i));

    return months.map(month => {
      const monthLabel = format(month, "MMM");
      const monthTransactions = transactions.filter(t => isSameMonth(new Date(t.date), month));

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        name: monthLabel,
        income,
        expenses
      };
    });
  }, [transactions]);

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Cash Flow</h3>
          <p className="text-sm text-muted-foreground">Income vs Expenses trend</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse bg-secondary/20 rounded-xl">
            <span className="text-muted-foreground text-sm">Loading chart data...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 20%, 18%)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 25%, 10%)",
                  border: "1px solid hsl(220, 20%, 18%)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                itemStyle={{ fontSize: '13px' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(187, 100%, 50%)"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="hsl(160, 100%, 45%)"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
