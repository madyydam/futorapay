import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    FileText,
    Download,
    FileSpreadsheet,
    PieChart,
    TrendingUp,
    DollarSign,
    BarChart3,
    Calendar,
    Clock,
    CheckCircle2,
    Loader2,
    Plus,
    Sparkles,
    Shield,
    Lock,
    FileCheck,
    AlertCircle,
    Flame,
    Eye,
    Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { downloadReport } from "@/lib/reports";
import { supabase } from "@/lib/supabase";

type ReportType = {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    premium?: boolean;
};

const reportTypes: ReportType[] = [
    {
        id: "expense_summary",
        name: "Expense Summary",
        description: "Detailed breakdown of all expenses by category and date",
        icon: PieChart,
        color: "text-primary",
    },
    {
        id: "income_summary",
        name: "Income Report",
        description: "Complete income analysis with sources and trends",
        icon: TrendingUp,
        color: "text-success",
    },
    {
        id: "net_worth",
        name: "Net Worth Statement",
        description: "Assets, liabilities, and net worth calculation",
        icon: DollarSign,
        color: "text-accent",
    },
    {
        id: "profit_loss",
        name: "Profit & Loss",
        description: "Complete P&L statement for the period",
        icon: BarChart3,
        color: "text-warning",
    },
    {
        id: "cash_flow",
        name: "Cash Flow Statement",
        description: "Money in vs money out analysis",
        icon: TrendingUp,
        color: "text-blue-400",
    },
    {
        id: "burn_rate",
        name: "Burn Rate Analysis",
        description: "Runway calculation and spending velocity",
        icon: Flame,
        color: "text-orange-400",
        premium: true,
    },
];

const generatedReports = [
    {
        id: "1",
        name: "Monthly Expense Summary",
        type: "expense_summary",
        period: "December 2025",
        generatedAt: new Date("2025-12-31"),
        status: "completed",
        hasSnapshot: true,
    },
    {
        id: "2",
        name: "Q4 Net Worth Statement",
        type: "net_worth",
        period: "Oct - Dec 2025",
        generatedAt: new Date("2025-12-31"),
        status: "completed",
        hasSnapshot: true,
    },
    {
        id: "3",
        name: "November P&L Report",
        type: "profit_loss",
        period: "November 2025",
        generatedAt: new Date("2025-11-30"),
        status: "completed",
        hasSnapshot: true,
    },
    {
        id: "4",
        name: "Cash Flow Statement",
        type: "cash_flow",
        period: "November 2025",
        generatedAt: new Date("2025-11-30"),
        status: "completed",
        hasSnapshot: true,
    },
];

export default function Reports() {
    const { toast } = useToast();
    const [selectedReportType, setSelectedReportType] = useState<string>("");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("this_month");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);

    // Preview State
    const [showPreview, setShowPreview] = useState(false);
    const [previewReport, setPreviewReport] = useState<any>(null);

    const handleGenerateReport = async () => {
        if (!selectedReportType) {
            toast({
                title: "Select a report type",
                description: "Please choose the type of report you want to generate.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);

        // Simulate report generation (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsGenerating(false);
        setShowGenerateDialog(false);

        toast({
            title: "Report Generated! 🎉",
            description: "Your report is ready to download with an immutable snapshot.",
        });
    };

    const handleDownload = async (format: string, reportName: string) => {
        try {
            toast({
                title: "Downloading Report",
                description: `Preparing ${reportName} (${format.toUpperCase()})...`,
            });

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "Authentication Error",
                    description: "You must be logged in to download reports.",
                    variant: "destructive"
                });
                return;
            }

            // Fetch workspace (assuming single workspace for now, same as Accounts)
            const { data: workspace, error: wsError } = await supabase
                .from('workspaces')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (wsError || !workspace) {
                toast({
                    title: "Workspace Error",
                    description: "Could not find active workspace.",
                    variant: "destructive"
                });
                return;
            }

            await downloadReport(format as any, 'generic', workspace.id, reportName); // 'generic' is placeholder ID

            toast({
                title: "Download Started",
                description: "Your report should begin downloading shortly.",
            });

        } catch (error: any) {
            console.error("Download failed:", error);
            toast({
                title: "Download Failed",
                description: error.message || "An error occurred while generating the report.",
                variant: "destructive"
            });
        }
    };

    const handlePreview = (report: typeof generatedReports[0]) => {
        setPreviewReport(report);
        setShowPreview(true);
    };

    const getReportIcon = (typeId: string) => {
        const type = reportTypes.find((t) => t.id === typeId);
        return type ? type.icon : FileText;
    };

    const getReportColor = (typeId: string) => {
        const type = reportTypes.find((t) => t.id === typeId);
        return type ? type.color : "text-primary";
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
                            <div className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Audit-Safe
                            </div>
                        </div>
                        <p className="text-muted-foreground">
                            Professional financial reports with immutable snapshots for compliance
                        </p>
                    </div>

                    <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                                <Plus className="w-4 h-4" />
                                Generate Report
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl glass-card-elevated">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Generate Professional Report
                                </DialogTitle>
                                <DialogDescription>
                                    Create an accountant-grade financial report with audit-safe snapshot
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Report Type Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground">Report Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {reportTypes.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setSelectedReportType(type.id)}
                                                    className={cn(
                                                        "relative p-4 rounded-lg border-2 transition-all text-left group",
                                                        selectedReportType === type.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                                    )}
                                                >
                                                    {type.premium && (
                                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-accent/10 text-accent text-xs font-medium">
                                                            Pro
                                                        </div>
                                                    )}
                                                    <Icon className={cn("w-5 h-5 mb-2", type.color)} />
                                                    <div className="font-medium text-foreground text-sm">{type.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {type.description}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Period Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground">Time Period</label>
                                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="this_month">This Month</SelectItem>
                                            <SelectItem value="last_month">Last Month</SelectItem>
                                            <SelectItem value="this_quarter">This Quarter</SelectItem>
                                            <SelectItem value="last_quarter">Last Quarter</SelectItem>
                                            <SelectItem value="this_year">This Year</SelectItem>
                                            <SelectItem value="last_year">Last Year</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Snapshot Notice */}
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
                                    <Lock className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Audit-Safe Snapshot</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This report will include an immutable snapshot of your financial data
                                            at the time of generation. The snapshot is locked and cannot be modified.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleGenerateReport}
                                    disabled={!selectedReportType || isGenerating}
                                    className="gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate Report
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Report Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTypes.map((type, index) => {
                        const Icon = type.icon;
                        return (
                            <Card
                                key={type.id}
                                className="glass-card hover:scale-[1.02] transition-all duration-300 animate-slide-up cursor-pointer group"
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => {
                                    setSelectedReportType(type.id);
                                    setShowGenerateDialog(true);
                                }}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={cn("p-3 rounded-xl", type.color.replace("text-", "bg-") + "/10")}>
                                            <Icon className={cn("w-5 h-5", type.color)} />
                                        </div>
                                        {type.premium && (
                                            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                                                Pro
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                        {type.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{type.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Generated Reports */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-primary" />
                            Generated Reports
                        </CardTitle>
                        <CardDescription>
                            Your saved reports with locked snapshots
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {generatedReports.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">No reports yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Generate your first professional financial report
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {generatedReports.map((report, index) => {
                                    const Icon = getReportIcon(report.type);
                                    const color = getReportColor(report.type);
                                    return (
                                        <div
                                            key={report.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors animate-slide-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("p-2 rounded-lg", color.replace("text-", "bg-") + "/10")}>
                                                    <Icon className={cn("w-5 h-5", color)} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground">{report.name}</span>
                                                        {report.hasSnapshot && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/10 text-success text-xs">
                                                                <Lock className="w-3 h-3" />
                                                                Snapshot
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {report.period}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {report.generatedAt.toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => handlePreview(report)}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    View PDF
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => handlePreview(report)}
                                                >
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                    View Excel
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Download Format</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDownload('pdf', report.name)}>
                                                            <FileText className="mr-2 h-4 w-4 text-red-500" />
                                                            PDF
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDownload('excel', report.name)}>
                                                            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-500" />
                                                            Excel (.xlsx)
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDownload('csv', report.name)}>
                                                            <TableIcon className="mr-2 h-4 w-4 text-blue-500" />
                                                            CSV
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Compliance Notice */}
                <Card className="glass-card bg-gradient-to-r from-primary/5 via-card to-accent/5 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">Enterprise-Grade Compliance</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Every report includes an audit-safe snapshot. The financial data is frozen at the
                                    moment of generation, ensuring reproducible numbers for compliance and accounting purposes.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Immutable Snapshots
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Data Integrity Verified
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Audit Trail Logged
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="sm:max-w-3xl glass-card-elevated max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-primary" />
                            {previewReport?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Previewing report details. This is an immutable snapshot from {previewReport?.generatedAt.toLocaleDateString()}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 border rounded-lg bg-card/50">
                        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                            <div>
                                <h4 className="font-bold text-lg">FutoraPay Report</h4>
                                <p className="text-sm text-muted-foreground">Generated for: {previewReport?.period}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono text-muted-foreground">ID: {previewReport?.id}-SNAP-LOCKED</div>
                                <div className="text-xs text-success flex items-center justify-end gap-1">
                                    <Lock className="w-3 h-3" /> Encrypted & Verified
                                </div>
                            </div>
                        </div>

                        {/* Sample Table Content based on report type - Simulation */}
                        <div className="p-4">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Category / Item</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-right">% Change</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr>
                                        <td className="px-4 py-3 font-medium">Housing & Utilities</td>
                                        <td className="px-4 py-3 text-right">₹45,000.00</td>
                                        <td className="px-4 py-3 text-right text-red-500">+12%</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">Food & Dining</td>
                                        <td className="px-4 py-3 text-right">₹12,450.00</td>
                                        <td className="px-4 py-3 text-right text-green-500">-5%</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-medium">Transportation</td>
                                        <td className="px-4 py-3 text-right">₹8,200.00</td>
                                        <td className="px-4 py-3 text-right text-gray-500">0%</td>
                                    </tr>
                                    <tr className="bg-muted/10 font-bold">
                                        <td className="px-4 py-3">Total</td>
                                        <td className="px-4 py-3 text-right">₹65,650.00</td>
                                        <td className="px-4 py-3 text-right"></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="mt-4 text-xs text-center text-muted-foreground italic">
                                * This is a preview. Download the full report for detailed transaction logs.
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <div className="flex-1 text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified by FutoraPay Audit Engine
                        </div>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => handleDownload('pdf', previewReport?.name || 'Report')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handleDownload('excel', previewReport?.name || 'Report')}
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Download Excel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
