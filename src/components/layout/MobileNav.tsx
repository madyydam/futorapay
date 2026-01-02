import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  User,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: DollarSign, label: "Net Worth", path: "/net-worth" },
  { icon: Wallet, label: "Expenses", path: "/expenses" },
  { icon: TrendingUp, label: "Income", path: "/income" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border lg:hidden">
      <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <div
                className={cn(
                  "p-1.5 transition-all duration-200",
                  isActive && "text-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
