import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Information", value: "Madhur" },
      { icon: Mail, label: "Email", value: "madhur@example.com" },
      { icon: Phone, label: "Phone", value: "+91 98765 43210" },
      { icon: Globe, label: "Language", value: "English" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: CreditCard, label: "Currency", value: "INR (₹)" },
      { icon: Bell, label: "Notifications", value: "Enabled" },
      { icon: Shield, label: "Security", value: "2FA Enabled" },
    ],
  },
];

export default function Profile() {
  const [isDarkMode, setIsDarkMode] = useState(true);

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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">M</span>
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full border-4 border-card" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold text-foreground">Madhur</h2>
              <p className="text-muted-foreground">Premium Member</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  Pro Plan
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                  Verified
                </span>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
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
          <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Download className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-foreground">Export Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors border-t border-border">
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
