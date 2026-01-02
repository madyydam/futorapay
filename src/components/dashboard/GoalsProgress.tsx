import { Target, TrendingUp, Inbox } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { memo, useMemo } from "react";
import { useGoals } from "@/hooks/useGoals";

export const GoalsProgress = memo(function GoalsProgress() {
  const { goals, isLoading } = useGoals();

  const displayGoals = useMemo(() => {
    return goals?.slice(0, 3).map(goal => ({
      ...goal,
      progress: Math.min((goal.current_amount / goal.target_amount) * 100, 100),
      color: goal.color.replace('text-', 'bg-') // Simple mapping attempting to reuse text-color for bg
    })) || [];
  }, [goals]);

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
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-secondary/50 rounded-xl" />
            ))}
          </div>
        ) : displayGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-50">
            <Inbox className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No savings goals yet</p>
          </div>
        ) : (
          displayGoals.map((goal) => {
            return (
              <div key={goal.id} className="space-y-2 group cursor-default">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {goal.name}
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">
                    ₹{(Number(goal.current_amount) / 1000).toFixed(1)}k / ₹{(Number(goal.target_amount) / 1000).toFixed(0)}k
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
          })
        )}
      </div>
    </div>
  );
});
