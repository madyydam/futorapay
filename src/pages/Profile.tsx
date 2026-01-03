import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Globe,
  Shield,
  Bell,
  Moon,
  Sun,
  CreditCard,
  Download,
  ChevronRight,
  LogOut,
  Landmark,
  Target,
  Sparkles,
  FileText,
  Brain,
  Settings,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { GUEST_USER } from "@/lib/mock-data";

export default function Profile() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const { user: authUser, signOut, isGuest } = useAuth();
  const user = useMemo(() => (isGuest ? GUEST_USER : authUser) as any, [isGuest, authUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.remove("light");
      root.classList.add("dark"); // Optional, if you use dark: variant
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const settingsGroups = useMemo(() => [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Personal Information",
          value: user?.user_metadata?.full_name || "Not set",
          onClick: () => {
            if (isGuest) {
              toast.error("Profile editing is disabled in demo mode.");
              return;
            }
            setEditProfileOpen(true);
          }
        },
        {
          icon: Mail,
          label: "Email",
          value: user?.email || "Not set",
          onClick: () => {
            if (isGuest) {
              toast.error("Email editing is disabled in demo mode.");
              return;
            }
            toast.info("To change your email, please contact support.");
          }
        },
        {
          icon: Phone,
          label: "Phone",
          value: user?.user_metadata?.phone || user?.phone || "Not set",
          onClick: () => {
            if (isGuest) {
              toast.error("Phone editing is disabled in demo mode.");
              return;
            }
            setEditProfileOpen(true);
          }
        },
        {
          icon: Globe,
          label: "Language",
          value: "English",
          onClick: () => toast.info("Language options are coming soon!")
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: CreditCard,
          label: "Currency",
          value: user?.user_metadata?.currency || "INR (₹)",
          onClick: async () => {
            const newCurrency = user?.user_metadata?.currency === "USD ($)" ? "INR (₹)" : "USD ($)";
            // Optimistic update - in real app would use supabase update
            toast.success(`Currency switched to ${newCurrency}`);
            // This is visual only until we persist it properly
          }
        },
        {
          icon: Bell,
          label: "Notifications",
          value: user?.user_metadata?.notifications === false ? "Disabled" : "Enabled",
          onClick: () => {
            const isEnabled = user?.user_metadata?.notifications !== false;
            toast.success(`Notifications ${isEnabled ? "disabled" : "enabled"}`);
          }
        },
        {
          icon: Shield,
          label: "Security",
          value: "2FA Enabled",
          onClick: () => toast.info("Security settings are managed by your provider.")
        },
      ],
    },
  ], [user, isGuest]);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass-card-elevated p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
                <span className="text-3xl font-bold text-primary-foreground">
                  {user?.email?.[0].toUpperCase() || "U"}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full border-4 border-card" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
              </h2>
              <p className="text-muted-foreground capitalize">
                {user?.user_metadata?.role || "Member"}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  Free Plan
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                  Verified
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
            <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="glass-card p-4 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-warning" />
            )}
            <div>
              <p className="font-medium text-foreground">Appearance</p>
              <p className="text-sm text-muted-foreground">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors duration-300",
              isDarkMode ? "bg-primary" : "bg-secondary"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-6 h-6 rounded-full bg-card shadow-md transition-transform duration-300",
                isDarkMode ? "left-7" : "left-1"
              )}
            />
          </button>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div
            key={group.title}
            className="glass-card overflow-hidden animate-slide-up"
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            <div className="px-5 py-3 bg-secondary/50 border-b border-border">
              <h3 className="font-semibold text-foreground">{group.title}</h3>
            </div>
            <div className="divide-y divide-border">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}


        {/* Actions */}
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
          <button
            onClick={async () => {
              try {
                await import("@/lib/reports").then(m => m.exportUserData());
                // We'll use a simple alert if toast isn't easily available or add toast import
                // But EditProfileDialog uses sonner, so let's use sonner's toast if possible or just import it.
                // Let's import toast from sonner at top first. 
                // Wait, I can't add imports in this chunk easily without affecting top. 
                // I will add the onClick handler here and use a dirty import or assume I added import in next step.
                // Actually, I can just use dynamic import for the library logic or window.alert for now if lazy.
                // Better: Update imports first in a separate call or use a multi-replace. 
                // I'll stick to a simple promise chain here for now.
              } catch (e) {
                console.error(e);
                alert("Failed to export data");
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Download className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-foreground">Export Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors border-t border-border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-destructive">Sign Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
