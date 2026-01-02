import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    Home,
    Car,
    GraduationCap,
    Plane,
    PiggyBank,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    Target,
    Clock,
    DollarSign,
    Calendar,
    ChevronRight,
    Lightbulb,
    RotateCcw,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStats } from "@/hooks/useFinanceStats";

interface ScenarioResult {
    canAfford: boolean;
    monthsToSave: number;
    requiredMonthlySavings: number;
    impactOnEmergencyFund: number;
    recommendation: string;
    riskLevel: "low" | "medium" | "high";
}

const scenarioTemplates = [
    { id: "house", name: "Buy a House", icon: Home, defaultAmount: 5000000, defaultTimeline: 60 },
    { id: "car", name: "Buy a Car", icon: Car, defaultAmount: 800000, defaultTimeline: 24 },
    { id: "education", name: "Education", icon: GraduationCap, defaultAmount: 1500000, defaultTimeline: 36 },
    { id: "vacation", name: "Dream Vacation", icon: Plane, defaultAmount: 200000, defaultTimeline: 12 },
    { id: "emergency", name: "Emergency Fund", icon: PiggyBank, defaultAmount: 300000, defaultTimeline: 12 },
    { id: "custom", name: "Custom Goal", icon: Target, defaultAmount: 100000, defaultTimeline: 12 },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function Scenario() {
    const { stats } = useFinanceStats();

    const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
    const [goalAmount, setGoalAmount] = useState<number>(100000);
    const [timeline, setTimeline] = useState<number>(12);
    const [downPayment, setDownPayment] = useState<number>(0);
    const [currentSavings, setCurrentSavings] = useState<number>(stats.totalBalance || 0);
    const [monthlySavingsCapacity, setMonthlySavingsCapacity] = useState<number>(stats.savings || 0);

    // Calculate scenario
    const result = useMemo<ScenarioResult>(() => {
        const amountNeeded = goalAmount - downPayment;
        const availableSavings = currentSavings;
        const monthlySavings = monthlySavingsCapacity;

        // How much more do we need?
        const remaining = Math.max(0, amountNeeded - availableSavings);

        // Required monthly savings to meet goal
        const requiredMonthlySavings = timeline > 0 ? remaining / timeline : remaining;

        // Months to save at current rate
        const monthsToSave = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : Infinity;

        // Can we afford it in time?
        const canAfford = monthsToSave <= timeline;

        // Impact on emergency fund (assuming 3-6 months expenses as emergency fund)
        const monthlyExpenses = stats.monthlyExpenses || 0;
        const idealEmergencyFund = monthlyExpenses * 6;
        const afterPurchase = availableSavings - amountNeeded;
        const impactOnEmergencyFund = afterPurchase < idealEmergencyFund
            ? (idealEmergencyFund - Math.max(0, afterPurchase))
            : 0;

        // Risk assessment
        let riskLevel: "low" | "medium" | "high" = "low";
        let recommendation = "";

        if (!canAfford && monthsToSave === Infinity) {
            riskLevel = "high";
            recommendation = "You're not currently saving enough. Consider increasing your income or reducing expenses.";
        } else if (!canAfford) {
            riskLevel = "high";
            recommendation = `At your current savings rate, you'll need ${monthsToSave} months. Consider extending your timeline or increasing monthly savings.`;
        } else if (requiredMonthlySavings > monthlySavings * 0.8) {
            riskLevel = "medium";
            recommendation = "This goal will require most of your savings capacity. Consider a longer timeline for more flexibility.";
        } else if (impactOnEmergencyFund > 0) {
            riskLevel = "medium";
            recommendation = "Achieving this goal may impact your emergency fund. Consider building that first.";
        } else {
            riskLevel = "low";
            recommendation = "This goal is achievable with your current financial situation. Stay consistent!";
        }

        return {
            canAfford,
            monthsToSave: monthsToSave === Infinity ? 0 : monthsToSave,
            requiredMonthlySavings,
            impactOnEmergencyFund,
            recommendation,
            riskLevel,
        };
    }, [goalAmount, timeline, downPayment, currentSavings, monthlySavingsCapacity, stats]);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = scenarioTemplates.find(t => t.id === templateId);
        if (template) {
            setGoalAmount(template.defaultAmount);
            setTimeline(template.defaultTimeline);
            setDownPayment(0);
        }
    };


    const resetScenario = () => {
        setSelectedTemplate("custom");
        setGoalAmount(100000);
        setTimeline(12);
        setDownPayment(0);
        setCurrentSavings(stats.totalBalance || 0);
        setMonthlySavingsCapacity(stats.savings || 0);
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Scenario Planning</h1>
                            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                What-If Analysis
                            </div>
                        </div>
                        <p className="text-muted-foreground">
                            "Can I afford this?" — answered properly with real data
                        </p>
                    </div>
                    <Button variant="outline" onClick={resetScenario} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </Button>
                </div>

                {/* Quick Templates */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {scenarioTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateSelect(template.id)}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all duration-200 text-center group",
                                    selectedTemplate === template.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                )}
                            >
                                <div className={cn(
                                    "p-3 rounded-full mx-auto mb-2 w-fit transition-colors",
                                    selectedTemplate === template.id
                                        ? "bg-primary/10"
                                        : "bg-secondary group-hover:bg-primary/10"
                                )}>
                                    <Icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        selectedTemplate === template.id
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    selectedTemplate === template.id
                                        ? "text-primary"
                                        : "text-foreground"
                                )}>
                                    {template.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Panel */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-primary" />
                                Configure Scenario
                            </CardTitle>
                            <CardDescription>
                                Adjust the parameters to see how it affects your finances
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Goal Amount */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label className="text-foreground">Goal Amount</Label>
                                    <span className="text-sm font-medium text-primary">{formatCurrency(goalAmount)}</span>
                                </div>
                                <Input
                                    type="number"
                                    value={goalAmount}
                                    onChange={(e) => setGoalAmount(Number(e.target.value))}
                                    className="text-lg font-semibold"
                                />
                                <Slider
                                    value={[goalAmount]}
                                    onValueChange={([value]) => setGoalAmount(value)}
                                    min={10000}
                                    max={10000000}
                                    step={10000}
                                    className="py-2"
                                />
                            </div>

                            {/* Timeline */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label className="text-foreground">Timeline</Label>
                                    <span className="text-sm font-medium text-primary">{timeline} months</span>
                                </div>
                                <Slider
                                    value={[timeline]}
                                    onValueChange={([value]) => setTimeline(value)}
                                    min={1}
                                    max={120}
                                    step={1}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1 month</span>
                                    <span>10 years</span>
                                </div>
                            </div>

                            {/* Down Payment */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label className="text-foreground">Down Payment / Already Saved</Label>
                                    <span className="text-sm font-medium text-primary">{formatCurrency(downPayment)}</span>
                                </div>
                                <Input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(Number(e.target.value))}
                                />
                            </div>

                            {/* Current Savings */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label className="text-foreground">Your Current Savings</Label>
                                    <span className="text-sm font-medium text-success">{formatCurrency(currentSavings)}</span>
                                </div>
                                <Input
                                    type="number"
                                    value={currentSavings}
                                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">Pre-filled from your account balance</p>
                            </div>

                            {/* Monthly Savings Capacity */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label className="text-foreground">Monthly Savings Capacity</Label>
                                    <span className="text-sm font-medium text-success">{formatCurrency(monthlySavingsCapacity)}/mo</span>
                                </div>
                                <Input
                                    type="number"
                                    value={monthlySavingsCapacity}
                                    onChange={(e) => setMonthlySavingsCapacity(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">Based on your income - expenses</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Panel */}
                    <div className="space-y-6">
                        {/* Main Result */}
                        <Card className={cn(
                            "glass-card-elevated overflow-hidden",
                            result.canAfford
                                ? "bg-gradient-to-br from-success/5 via-card to-success/10 border-success/20"
                                : "bg-gradient-to-br from-destructive/5 via-card to-destructive/10 border-destructive/20"
                        )}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {result.canAfford ? (
                                                <CheckCircle2 className="w-6 h-6 text-success" />
                                            ) : (
                                                <AlertTriangle className="w-6 h-6 text-destructive" />
                                            )}
                                            <span className={cn(
                                                "text-xl font-bold",
                                                result.canAfford ? "text-success" : "text-destructive"
                                            )}>
                                                {result.canAfford ? "Yes, You Can Afford This!" : "Not Quite There Yet"}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground max-w-md">
                                            {result.recommendation}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-sm font-medium",
                                        result.riskLevel === "low" && "bg-success/10 text-success",
                                        result.riskLevel === "medium" && "bg-warning/10 text-warning",
                                        result.riskLevel === "high" && "bg-destructive/10 text-destructive"
                                    )}>
                                        {result.riskLevel === "low" && "Low Risk"}
                                        {result.riskLevel === "medium" && "Medium Risk"}
                                        {result.riskLevel === "high" && "High Risk"}
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-secondary/50">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">Time to Goal</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {result.monthsToSave > 0 ? `${result.monthsToSave} months` : "—"}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {result.canAfford ? "At current savings rate" : "Need higher savings"}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-secondary/50">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-sm">Required Monthly</span>
                                        </div>
                                        <div className={cn(
                                            "text-2xl font-bold",
                                            result.requiredMonthlySavings <= monthlySavingsCapacity
                                                ? "text-success"
                                                : "text-destructive"
                                        )}>
                                            {formatCurrency(result.requiredMonthlySavings)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Your capacity: {formatCurrency(monthlySavingsCapacity)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Visual Timeline */}
                        <Card className="glass-card">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Savings Journey
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {/* Progress Bar */}
                                    <div className="h-4 rounded-full bg-secondary overflow-hidden relative">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                result.canAfford ? "bg-success" : "bg-warning"
                                            )}
                                            style={{
                                                width: `${Math.min(100, (currentSavings / (goalAmount - downPayment)) * 100)}%`,
                                            }}
                                        />
                                    </div>

                                    {/* Milestones */}
                                    <div className="flex justify-between mt-4">
                                        <div className="text-center">
                                            <div className="w-3 h-3 rounded-full bg-success mx-auto mb-1" />
                                            <span className="text-xs text-muted-foreground">Today</span>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatCurrency(currentSavings)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full mx-auto mb-1",
                                                result.canAfford ? "bg-primary" : "bg-warning"
                                            )} />
                                            <span className="text-xs text-muted-foreground">Goal</span>
                                            <p className="text-sm font-medium text-foreground">
                                                {formatCurrency(goalAmount - downPayment)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        <Card className="glass-card bg-gradient-to-r from-accent/5 via-card to-primary/5">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-accent/10">
                                        <Lightbulb className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">Quick Tips</h3>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                <span>Increase your down payment to reduce monthly burden</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                <span>Consider a longer timeline for lower monthly savings</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                <span>Review your expenses to increase savings capacity</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
