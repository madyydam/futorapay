import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo, memo } from "react";
import { Inbox } from "lucide-react";

const COLORS = [
  "hsl(187, 100%, 50%)", // Neon Blue
  "hsl(160, 100%, 45%)", // Neon Green
  "hsl(38, 92%, 50%)",  // Amber
  "hsl(280, 70%, 60%)", // Purple
  "hsl(340, 80%, 60%)", // Pink
  "hsl(210, 100%, 50%)", // Blue
];

export const CategoryPieChart = memo(function CategoryPieChart() {
  const { transactions, isLoading } = useTransactions();

  const chartData = useMemo(() => {
    if (!transactions) return [];

    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [transactions]);

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-foreground">Spending by Category</h3>
        <p className="text-sm text-muted-foreground">This month's breakdown</p>
      </div>

      <div className="h-[280px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse bg-secondary/20 rounded-xl">
            <span className="text-muted-foreground text-sm">Analyzing categories...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center opacity-50 space-y-2">
            <Inbox className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 25%, 10%)",
                  border: "1px solid hsl(220, 20%, 18%)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                itemStyle={{ fontSize: '13px' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "hsl(215, 20%, 65%)", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
