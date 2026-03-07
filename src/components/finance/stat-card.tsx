"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
  trend?: number;
  delay?: number;
  className?: string;
  variant?: "default" | "teal" | "amber" | "green" | "red";
}

function useCountUp(target: number, duration: number = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  prefix = "$",
  suffix,
  trend,
  delay = 0,
  className,
  variant = "default",
}: StatCardProps) {
  const animatedValue = useCountUp(Math.abs(value), 800 + delay * 100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 80);
    return () => clearTimeout(timer);
  }, [delay]);

  const variantStyles = {
    default: {
      card: "bg-white",
      icon: iconBg || "bg-teal-50",
      iconColor: iconColor || "text-teal-700",
    },
    teal: {
      card: "bg-[#1A5C5A]",
      icon: "bg-teal-500/20",
      iconColor: "text-amber-300",
    },
    amber: {
      card: "bg-amber-400",
      icon: "bg-amber-300/40",
      iconColor: "text-amber-900",
    },
    green: {
      card: "bg-white",
      icon: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    red: {
      card: "bg-white",
      icon: "bg-red-50",
      iconColor: "text-red-500",
    },
  };

  const styles = variantStyles[variant];
  const isLight = variant === "teal";
  const isAmber = variant === "amber";

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(2);
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 card-shadow card-shadow-hover",
        "opacity-0",
        visible && "animate-fade-in-up",
        styles.card,
        className
      )}
      style={{ animationDelay: `${delay * 80}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className={cn("text-xs font-medium uppercase tracking-wider", isLight || isAmber ? "text-white/70" : "text-muted-foreground")}>
          {title}
        </p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", styles.icon)}>
          <Icon size={15} className={styles.iconColor} />
        </div>
      </div>
      <div className={cn("stat-number text-3xl font-bold leading-none mb-1", isLight || isAmber ? "text-white" : value < 0 ? "text-red-500" : "text-foreground")}>
        {value < 0 ? "-" : ""}{prefix}{formatValue(animatedValue)}
        {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
      </div>
      {trend !== undefined && (
        <p className={cn("text-xs mt-2", trend >= 0 ? "text-emerald-500" : "text-red-400")}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}
