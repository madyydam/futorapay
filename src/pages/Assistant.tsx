import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Send,
  Sparkles,
  TrendingDown,
  PiggyBank,
  ShoppingCart,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const suggestedQuestions = [
  { icon: TrendingDown, text: "Where am I overspending?", color: "text-destructive" },
  { icon: ShoppingCart, text: "Can I afford a new phone?", color: "text-primary" },
  { icon: PiggyBank, text: "How can I save more this month?", color: "text-accent" },
  { icon: Lightbulb, text: "Give me investment tips", color: "text-warning" },
];

type Message = {
  id: number;
  type: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    type: "assistant",
    content: "Hello! 👋 I'm your AI financial assistant. I can help you understand your spending patterns, suggest ways to save money, and answer any questions about your finances. What would you like to know?",
  },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        overspending: "Based on your spending data, you're spending 40% more on food & dining compared to your average. Your top overspending categories are:\n\n• **Food & Dining**: ₹18,500 (vs ₹13,000 average)\n• **Shopping**: ₹12,000 (vs ₹8,000 average)\n\n💡 **Tip**: Consider meal prepping to reduce food expenses by up to ₹5,000/month.",
        phone: "Looking at your current savings rate and upcoming expenses, you could afford a phone up to ₹35,000 without impacting your emergency fund goals. If you want a higher-end device:\n\n• Save ₹8,000/month for 3 months\n• Or use your upcoming bonus wisely\n\nWould you like me to create a savings goal for this?",
        save: "Here are personalized ways to boost your savings:\n\n1. **Reduce subscriptions** - Cancel unused services (potential ₹2,000/month)\n2. **Meal planning** - Could save ₹4,000/month\n3. **Set up auto-save** - Move ₹10,000 to savings on payday\n\nWith these changes, you could save an additional ₹16,000/month! 🎯",
        investment: "Based on your risk profile and goals, here are my recommendations:\n\n📈 **Suggested Allocation:**\n• 60% Index Funds (Nifty 50, Nifty Next 50)\n• 25% Blue-chip stocks\n• 15% Fixed deposits for stability\n\n⚠️ Your current portfolio is slightly aggressive. Consider rebalancing for better risk management.",
      };

      const lowerInput = input.toLowerCase();
      let response = "I understand you're asking about your finances. Let me analyze your data and provide personalized insights. Could you be more specific about what aspect you'd like to explore?";

      if (lowerInput.includes("overspend") || lowerInput.includes("spending")) {
        response = responses.overspending;
      } else if (lowerInput.includes("phone") || lowerInput.includes("afford")) {
        response = responses.phone;
      } else if (lowerInput.includes("save") || lowerInput.includes("saving")) {
        response = responses.save;
      } else if (lowerInput.includes("invest") || lowerInput.includes("tip")) {
        response = responses.investment;
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        type: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] lg:h-screen p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 glow-effect">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Powered by advanced financial AI
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 glass-card flex flex-col overflow-hidden animate-slide-up">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] lg:max-w-[70%] p-4 rounded-2xl",
                    message.type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  )}
                >
                  {message.type === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary p-4 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 lg:px-6 pb-4">
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full text-sm text-foreground transition-colors"
                  >
                    <q.icon className={cn("w-4 h-4", q.color)} />
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 lg:p-6 border-t border-border">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about your finances..."
                className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                variant="gradient"
                size="icon"
                className="h-12 w-12 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
