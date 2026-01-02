import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Wallet } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 glow-effect">
          <Wallet className="text-primary-foreground w-4 h-4" />
        </div>
        <h1 className="font-bold text-lg gradient-text">FutoraPay</h1>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0 pt-16 lg:pt-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
