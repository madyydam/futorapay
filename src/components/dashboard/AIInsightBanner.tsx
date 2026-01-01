import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AIInsightBannerProps {
  insight: string;
  action?: string;
}

export function AIInsightBanner({ insight, action = "View Details" }: AIInsightBannerProps) {
  return (
    <div className="glass-card-elevated p-5 bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/20 animate-slide-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20 animate-pulse-glow flex-shrink-0">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">AI Insight</h3>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">{insight}</p>
          </div>
        </div>
        <Link to="/assistant">
          <Button variant="outline" className="shrink-0 gap-2 group">
            {action}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
