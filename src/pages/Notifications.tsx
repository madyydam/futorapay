import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Notifications() {
    const { notifications, isLoading, markAsRead, deleteNotification } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'warning': return AlertTriangle;
            case 'error': return AlertCircle;
            default: return Info;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'success': return "text-success";
            case 'warning': return "text-warning";
            case 'error': return "text-destructive";
            default: return "text-primary";
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return "bg-success/10";
            case 'warning': return "bg-warning/10";
            case 'error': return "bg-destructive/10";
            default: return "bg-primary/10";
        }
    };

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                <div className="space-y-1 animate-fade-in">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground">
                        Stay updated with your financial activity
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notification, index) => {
                            const Icon = getIcon(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "glass-card p-4 flex items-start justify-between gap-4 animate-slide-up transition-all",
                                        !notification.is_read && "border-primary/50 bg-primary/5"
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn("p-2 rounded-lg mt-1", getBgColor(notification.type))}>
                                            <Icon className={cn("w-5 h-5", getColor(notification.type))} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className={cn("font-medium text-foreground", !notification.is_read && "font-bold")}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground/60 pt-1">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        {!notification.is_read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                                onClick={() => markAsRead.mutate(notification.id)}
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteNotification.mutate(notification.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center flex flex-col items-center justify-center animate-fade-in">
                        <div className="p-4 rounded-full bg-secondary mb-4">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No notifications yet</h3>
                        <p className="text-muted-foreground">
                            When you have activity, it will show up here.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
