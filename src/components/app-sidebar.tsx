"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Users,
  PiggyBank,
  PieChart,
  BarChart3,
  Activity,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Wallet,
  Target,
} from "lucide-react";
import { signOutAction } from "@/app/actions";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/income", label: "Income", icon: TrendingUp },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/salaries", label: "Salaries", icon: Users },
  { href: "/dashboard/investments", label: "Investments", icon: PiggyBank },
  { href: "/dashboard/profit", label: "Profit Distribution", icon: PieChart },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/history", label: "Transaction History", icon: History },
  { href: "/dashboard/activity", label: "Activity Log", icon: Activity },
];

const personalNavItems = [
  { href: "/dashboard/personal", label: "Overview", icon: User },
  { href: "/dashboard/personal/income", label: "My Income", icon: TrendingUp },
  { href: "/dashboard/personal/expenses", label: "My Expenses", icon: Wallet },
  { href: "/dashboard/personal/savings", label: "Savings Goals", icon: Target },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
        style={{ backgroundColor: "hsl(var(--sidebar-background))" }}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 px-4 py-5 border-b", "border-[hsl(var(--sidebar-border))]")}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
            <Building2 size={16} className="text-teal-900" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-amber-50 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>FinanceOS</p>
              <p className="text-[10px] text-amber-200/60 leading-tight">Private Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "ml-auto p-1 rounded-md transition-colors",
              "text-[hsl(var(--sidebar-foreground))]/50 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
            )}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))]/40 px-3 mb-2">
              Company
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-amber-400 text-teal-900"
                    : "text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
                )}
              >
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          <div className="my-3 mx-3 border-t border-[hsl(var(--sidebar-border))]" />

          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))]/40 px-3 mb-2">
              Personal
            </p>
          )}
          {personalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-violet-400 text-violet-950"
                    : "text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
                )}
              >
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className={cn("p-3 border-t", "border-[hsl(var(--sidebar-border))]")}>
          <form action={signOutAction}>
            <button
              type="submit"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                "text-[hsl(var(--sidebar-foreground))]/60 hover:text-red-300 hover:bg-red-900/20"
              )}
            >
              <LogOut size={17} className="flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white flex items-center justify-around px-2 py-2">
        {[...navItems.slice(0, 4), { href: "/dashboard/personal", label: "Personal", icon: User }].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/dashboard/personal" && pathname?.startsWith("/dashboard/personal"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
