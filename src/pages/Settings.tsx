import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";

export default function Settings() {
    const { signOut, user } = useAuth();

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme ? savedTheme === "dark" : true;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.remove("light");
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            root.classList.add("light");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const handleExport = async () => {
        try {
            const { exportUserData } = await import("@/lib/reports");
            await exportUserData();
            toast.success("Data export started");
        } catch (error) {
            toast.error("Failed to export data");
        }
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
                <div className="space-y-1">
                    <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your application preferences and account settings.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Appearance Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize how FutoraPay looks on your device.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Moon className="h-4 w-4" />
                                    <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                                </div>
                                <Switch
                                    id="dark-mode"
                                    checked={isDarkMode}
                                    onCheckedChange={setIsDarkMode}
                                />
                            </div>
                            <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                                <div className="flex items-center space-x-2">
                                    <Monitor className="h-4 w-4" />
                                    <Label htmlFor="system-theme" className="text-base">Use System Theme</Label>
                                </div>
                                <Switch id="system-theme" disabled />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Manage your account information currently logged in as {user?.email}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">Sign Out</h3>
                                    <p className="text-sm text-muted-foreground">Log out of your active session on this device.</p>
                                </div>
                                <Button variant="destructive" onClick={signOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>
                                Export your financial data or reset your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base">Export Data</Label>
                                    <p className="text-sm text-muted-foreground">Download all your transactions and account data as JSON.</p>
                                </div>
                                <Button variant="outline" onClick={handleExport}>Export JSON</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
