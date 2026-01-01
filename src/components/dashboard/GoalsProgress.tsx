import { Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";

const GOALS_DATA = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 300000,
    current: 185000,
    color: "bg-primary",
  },
  {
    id: 2,
    name: "New Laptop",
    target: 150000,
    current: 95000,
    color: "bg-accent",
  },
  {
    id: 3,
    name: "Vacation Trip",
    target: 100000,
    current: 45000,
    color: "bg-warning",
  },
];

export const GoalsProgress = memo(function GoalsProgress() {
  const goalsWithProgress = useMemo(() => {
    return GOALS_DATA.map(goal => ({
      ...goal,
      progress: (goal.current / goal.target) * 100
    }));
  }, []);

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Savings Goals</h3>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        <div className="p-2.5 rounded-xl bg-secondary transition-colors hover:bg-secondary/80 cursor-pointer">
          <Target className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="space-y-5">
        {goalsWithProgress.map((goal) => {
          return (
            <div key={goal.id} className="space-y-2 group cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {goal.name}
                </span>
                <span className="text-sm text-muted-foreground font-mono">
                  ₹{(goal.current / 1000).toFixed(0)}k / ₹{(goal.target / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={goal.progress}
                  className="h-2.5 transition-all duration-1000 ease-out"
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-success animate-pulse" />
                <span>{goal.progress.toFixed(0)}% complete</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
