import { Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const goals = [
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

export function GoalsProgress() {
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Savings Goals</h3>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        <div className="p-2 rounded-lg bg-secondary">
          <Target className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{goal.name}</span>
                <span className="text-sm text-muted-foreground">
                  ₹{(goal.current / 1000).toFixed(0)}k / ₹{(goal.target / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-success" />
                <span>{progress.toFixed(0)}% complete</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
