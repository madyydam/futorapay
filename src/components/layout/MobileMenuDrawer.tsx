import {
    Landmark,
    Target,
    RefreshCw,
    Sparkles,
    FileText,
    Brain,
    Bell,
    Settings,
    LogOut,
    Menu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: Landmark, label: "Accounts", path: "/accounts" },
    { icon: Target, label: "Goals", path: "/goals" },
    { icon: RefreshCw, label: "Subscriptions", path: "/subscriptions" },
    { icon: Sparkles, label: "Scenario", path: "/scenario" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Brain, label: "Insights", path: "/insights" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Settings, label: "Settings", path: "/settings" },
];

export function MobileMenuDrawer() {
    const { signOut } = useAuth();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-foreground animate-pulse-glow border border-primary/30"
                >
                    <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-sidebar border-l border-sidebar-border">
                <SheetHeader className="p-6 border-b border-sidebar-border">
                    <SheetTitle className="text-left gradient-text font-bold text-xl text-foreground">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-[calc(100vh-80px)]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <span className="font-medium text-foreground">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="p-4 border-t border-sidebar-border mt-auto">
                        <Button
                            variant="ghost"
                            onClick={signOut}
                            className="w-full justify-start gap-3 p-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
