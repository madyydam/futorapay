import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Food & Dining", value: 18500, color: "hsl(187, 100%, 50%)" },
  { name: "Shopping", value: 12000, color: "hsl(160, 100%, 45%)" },
  { name: "Transport", value: 8500, color: "hsl(38, 92%, 50%)" },
  { name: "Bills & Utilities", value: 15000, color: "hsl(280, 70%, 60%)" },
  { name: "Entertainment", value: 6000, color: "hsl(340, 80%, 60%)" },
];

export function CategoryPieChart() {
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-foreground">Spending by Category</h3>
        <p className="text-sm text-muted-foreground">This month's breakdown</p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
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
      </div>
    </div>
  );
}
