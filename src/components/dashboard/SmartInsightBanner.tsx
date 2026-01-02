import { Lightbulb, Sparkles } from "lucide-react";
import { Transaction } from "@/hooks/useTransactions";
import { useAuth } from "@/components/auth/AuthProvider";
import { memo, useMemo } from "react";

interface SmartInsightBannerProps {
  transactions: Transaction[];
}

export const SmartInsightBanner = memo(function SmartInsightBanner({ transactions }: SmartInsightBannerProps) {
  const { user } = useAuth();

  const insight = useMemo(() => {
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || "there";

    // Calculate insights
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Find top category this month
    const categoryTotals: Record<string, number> = {};
    currentMonthExpenses.forEach(t => {
      const cat = t.category.toLowerCase();
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    let insightMessage = "Track your spending to get personalized insights!";

    if (topCategory) {
      const [category, amount] = topCategory;

      // Compare with last month for this category
      const lastMonthCategoryTotal = lastMonthExpenses
        .filter(t => t.category.toLowerCase() === category)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      if (lastMonthCategoryTotal > 0) {
        const diff = amount - lastMonthCategoryTotal;
        const percent = Math.round((diff / lastMonthCategoryTotal) * 100);

        if (percent > 0) {
          insightMessage = `You've spent ${percent}% more on ${category} this month compared to last month. Consider planning to reduce expenses.`;
        } else if (percent < 0) {
          insightMessage = `Great job! You've spent ${Math.abs(percent)}% less on ${category} this month compared to last month.`;
        } else {
          insightMessage = `Your spending on ${category} is the same as last month.`;
        }
      } else {
        insightMessage = `Your highest spending is on ${category} (₹${amount.toLocaleString()}) this month.`;
      }
    } else if (transactions.length === 0) {
      insightMessage = "Start adding transactions to see your financial insights here!";
    }

    return { userName, insightMessage };
  }, [transactions, user]);

  return (
    <div className="glass-card-elevated p-5 bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/20 animate-slide-up relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-start gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-primary/20 animate-pulse-glow flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Smart Insight</h3>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Hi {insight.userName}, </span>
            {insight.insightMessage}
          </p>
        </div>
      </div>
    </div>
  );
});
