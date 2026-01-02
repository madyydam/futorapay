import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Car,
  Home,
  Plane,
  Smartphone,
  GraduationCap,
  Gem,
  MoreVertical,
  Plus,
  Trash2,
  TrendingUp,
  Loader2,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/useGoals";
import { AddGoalDialog } from "@/components/goals/AddGoalDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

const ICON_MAP: Record<string, any> = {
  Target, Car, Home, Plane, Smartphone, GraduationCap, Gem
};

export default function Goals() {
  const { goals, isLoading, deleteGoal, addSavings } = useGoals();
  const [addMoneyOpen, setAddMoneyOpen] = useState<string | null>(null);
  const [amountToAdd, setAmountToAdd] = useState("");

  const handleAddSavings = async (id: string) => {
    if (!amountToAdd || isNaN(Number(amountToAdd))) return;

    try {
      await addSavings.mutateAsync({ id, amount: Number(amountToAdd) });
      setAddMoneyOpen(null);
      setAmountToAdd("");
    } catch (e) {
      console.error(e);
    }
  };

  const calculations = useMemo(() => {
    const totalSavings = goals?.reduce((acc, goal) => acc + Number(goal.current_amount), 0) || 0;
    const totalTarget = goals?.reduce((acc, goal) => acc + Number(goal.target_amount), 0) || 0;
    const overallProgress = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;
    return { totalSavings, totalTarget, overallProgress };
  }, [goals]);

  const { totalSavings, totalTarget, overallProgress } = calculations;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">
              Track and achieve your financial dreams
            </p>
          </div>
          <AddGoalDialog />
        </div>

        {/* Overview Card */}
        <div className="glass-card p-6 bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/20 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Total Savings</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ₹{totalSavings.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  of ₹{totalTarget.toLocaleString()} goal
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium text-primary">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : goals.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center animate-fade-in space-y-4">
            <div className="p-4 rounded-full bg-secondary">
              <Target className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">No goals yet</h3>
              <p className="text-muted-foreground">Create a new savings goal to get started!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal, index) => {
              const Icon = ICON_MAP[goal.icon] || Target;
              const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              const isCompleted = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className="glass-card p-6 hover:scale-[1.01] transition-all duration-300 animate-slide-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-xl bg-opacity-10", goal.color.replace('text-', 'bg-'))}>
                      <Icon className={cn("w-6 h-6", goal.color)} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card-elevated">
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteGoal.mutate(goal.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Goal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-lg text-foreground mb-1">{goal.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Target: {new Date(goal.deadline).toLocaleDateString()}
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          ₹{Number(goal.current_amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          of ₹{Number(goal.target_amount).toLocaleString()}
                        </p>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold px-2 py-1 rounded-full",
                        isCompleted ? "bg-success/20 text-success" : "bg-secondary text-primary"
                      )}>
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <Progress
                      value={progress}
                      className="h-2"
                    // indicatorClassName={goal.color.replace('text-', 'bg-')} // Pass color dynamically if Progress component supported it, usually controlled by CSS vars or className
                    />

                    <Dialog open={addMoneyOpen === goal.id} onOpenChange={(open) => setAddMoneyOpen(open ? goal.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
                          disabled={isCompleted}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {isCompleted ? "Goal Reached!" : "Add Savings"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xs glass-card-elevated">
                        <DialogHeader>
                          <DialogTitle>Add Savings</DialogTitle>
                          <DialogDescription>Add money to {goal.name}</DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={amountToAdd}
                            onChange={(e) => setAmountToAdd(e.target.value)}
                            className="text-lg"
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={() => handleAddSavings(goal.id)} disabled={addSavings.isPending}>
                            {addSavings.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Add
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
