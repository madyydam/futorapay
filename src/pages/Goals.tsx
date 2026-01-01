import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Target,
  Plane,
  Laptop,
  Shield,
  GraduationCap,
  Car,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const goals = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 300000,
    current: 185000,
    icon: Shield,
    color: "from-primary to-cyan-400",
    deadline: "Dec 2025",
    monthlyTarget: 12000,
  },
  {
    id: 2,
    name: "New MacBook Pro",
    target: 200000,
    current: 125000,
    icon: Laptop,
    color: "from-accent to-emerald-400",
    deadline: "Mar 2025",
    monthlyTarget: 25000,
  },
  {
    id: 3,
    name: "Dream Vacation",
    target: 150000,
    current: 45000,
    icon: Plane,
    color: "from-warning to-orange-400",
    deadline: "Jun 2025",
    monthlyTarget: 17500,
  },
  {
    id: 4,
    name: "Higher Education",
    target: 500000,
    current: 180000,
    icon: GraduationCap,
    color: "from-purple-500 to-violet-400",
    deadline: "Dec 2026",
    monthlyTarget: 15000,
  },
  {
    id: 5,
    name: "Car Down Payment",
    target: 250000,
    current: 75000,
    icon: Car,
    color: "from-pink-500 to-rose-400",
    deadline: "Sep 2025",
    monthlyTarget: 20000,
  },
];

export default function Goals() {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">
              Track progress towards your financial milestones
            </p>
          </div>
          <Button variant="gradient" className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Create Goal
          </Button>
        </div>

        {/* Overall Progress Card */}
        <div className="glass-card-elevated p-6 bg-gradient-to-br from-primary/5 via-card to-accent/5 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Overall Progress</h3>
                  <p className="text-sm text-muted-foreground">Across all savings goals</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{(totalSaved / 100000).toFixed(1)}L saved
                  </span>
                  <span className="text-foreground font-medium">
                    ₹{(totalTarget / 100000).toFixed(1)}L target
                  </span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-sm text-primary font-medium">
                  {overallProgress.toFixed(1)}% complete
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
              <Sparkles className="w-5 h-5 text-accent" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Smart Tip:</span> Increase monthly
                savings by ₹5,000 to reach goals 3 months earlier
              </p>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, index) => {
            const progress = (goal.current / goal.target) * 100;
            const Icon = goal.icon;

            return (
              <div
                key={goal.id}
                className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br",
                    goal.color.replace("from-", "from-").replace("to-", "to-"),
                    "opacity-20"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      goal.color.includes("primary") ? "text-primary" :
                        goal.color.includes("accent") ? "text-accent" :
                          goal.color.includes("warning") ? "text-warning" :
                            goal.color.includes("purple") ? "text-purple-400" :
                              "text-pink-400"
                    )} />
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {goal.deadline}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-1">{goal.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Save ₹{goal.monthlyTarget.toLocaleString()}/month to reach goal
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      ₹{goal.current.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      ₹{goal.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-success font-medium">{progress.toFixed(0)}%</span>
                    <span className="text-muted-foreground">complete</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Goal Card */}
          <button className="glass-card p-5 border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[200px]">
            <div className="p-3 rounded-xl bg-secondary">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground font-medium">Add New Goal</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
