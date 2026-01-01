import { Lightbulb, Sparkles } from "lucide-react";

interface SmartInsightBannerProps {
  insight: string;
}

export function SmartInsightBanner({ insight }: SmartInsightBannerProps) {
  return (
    <div className="glass-card-elevated p-5 bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/20 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/20 animate-pulse-glow flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Smart Insight</h3>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">{insight}</p>
        </div>
      </div>
    </div>
  );
}
