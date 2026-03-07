"use client";

import {
  LucideIcon,
  TrendingUp,
  Receipt as ReceiptIcon,
  Users,
  Wallet,
  PiggyBank,
  Heart,
  User,
  BarChart3,
  Building2,
  Target,
  PieChart,
  Activity,
  History,
} from "lucide-react";
import { ReactNode } from "react";

const iconMap = {
  TrendingUp,
  Receipt: ReceiptIcon,
  Users,
  Wallet,
  PiggyBank,
  Heart,
  User,
  BarChart3,
  Building2,
  Target,
  PieChart,
  Activity,
  History,
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof iconMap;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon: iconName, action }: PageHeaderProps) {
  const Icon = iconName ? iconMap[iconName] : null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[#1A5C5A]/10 flex items-center justify-center">
            <Icon size={18} className="text-[#1A5C5A]" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            {title}
          </h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
