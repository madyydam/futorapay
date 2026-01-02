
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { Download, FileDown, Printer, Filter } from "lucide-react";
import { toast } from "sonner";

// Mock data simulating the 'view_analytics_monthly_summary'
const monthlyData = [
    { month: 'Jan', income: 45000, expense: 32000, savings: 13000 },
    { month: 'Feb', income: 52000, expense: 34000, savings: 18000 },
    { month: 'Mar', income: 48000, expense: 29000, savings: 19000 },
    { month: 'Apr', income: 61000, expense: 42000, savings: 19000 },
    { month: 'May', income: 55000, expense: 38000, savings: 17000 },
    { month: 'Jun', income: 67000, expense: 45000, savings: 22000 },
];

const categoryData = [
    { name: 'Food & Dining', value: 12000, color: '#FF8042' },
    { name: 'Shopping', value: 8500, color: '#0088FE' },
    { name: 'Transport', value: 4500, color: '#00C49F' },
    { name: 'Bills', value: 15000, color: '#FFBB28' },
    { name: 'Entertainment', value: 5000, color: '#8884d8' },
];

export default function Reports() {
    const handleExport = (format: string) => {
        toast.success(`Exporting report as ${format}...`);
        // Logic to generate PDF/CSV would go here
        setTimeout(() => {
            toast.success("Report downloaded successfully!");
        }, 1500);
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Financial Reports</h1>
                        <p className="text-muted-foreground">
                            Deep dive into your financial health with enterprise-grade analytics.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Last 6 Months
                        </Button>
                        <Button variant="default" className="gap-2" onClick={() => handleExport("PDF")}>
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income (YTD)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">₹ 3,28,000</div>
                            <p className="text-xs text-muted-foreground mt-1">+12% from last year</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses (YTD)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">₹ 2,20,000</div>
                            <p className="text-xs text-muted-foreground mt-1">+5% from last year</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Net Savings Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">32.9%</div>
                            <p className="text-xs text-muted-foreground mt-1">Target: 30%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-secondary/50 p-1">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="income">Income Analysis</TabsTrigger>
                        <TabsTrigger value="expense">Expense Breakdown</TabsTrigger>
                        <TabsTrigger value="networth">Net Worth</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card className="glass-card-elevated">
                                <CardHeader>
                                    <CardTitle>Income vs Expenses</CardTitle>
                                    <CardDescription>Monthly comparison for the last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                            <Bar dataKey="income" name="Income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="expense" name="Expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="glass-card-elevated">
                                <CardHeader>
                                    <CardTitle>Spending by Category</CardTitle>
                                    <CardDescription>Where your money went this month</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
                                        {categoryData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                <span>{entry.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Savings Trend</CardTitle>
                                <CardDescription>Your monthly savings growth over time</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Line type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="income">
                        <div className="flex items-center justify-center p-12 text-muted-foreground border border-dashed rounded-xl">
                            Detailed Income Analysis coming soon with Advanced Mode
                        </div>
                    </TabsContent>
                    {/* Other tabs placeholders */}
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
