
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";

export default function Settings() {
    const { signOut, user } = useAuth();
    // In a real app, these would be connected to a theme context or user profile updater
    // For now, we'll keep it as a UI shell that "works" visually

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
                                <Switch id="dark-mode" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Monitor className="h-4 w-4" />
                                    <Label htmlFor="system-theme" className="text-base">Use System Theme</Label>
                                </div>
                                <Switch id="system-theme" />
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

                    {/* Data Management Placeholder - For Manual Finance Vision */}
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
                                <Button variant="outline">Export JSON</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
