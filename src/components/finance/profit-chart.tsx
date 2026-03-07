"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FinanceSummary } from "@/types/finance";

interface Props {
  summary: FinanceSummary;
}

export function ProfitChart({ summary }: Props) {
  const data = [
    { name: "Yassen (47.5%)", value: summary.partnerShare },
    { name: "Aryan (47.5%)", value: summary.partnerShare },
    { name: "Charity (5%)", value: summary.charity },
    { name: "Investment Reserve", value: summary.totalInvestments },
  ].filter((d) => d.value > 0);

  const COLORS = ["#7C3AED", "#4F46E5", "#E8A838", "#10B981"];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px]">
        <p className="text-xs text-muted-foreground">Add financial data to see distribution</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
          contentStyle={{ borderRadius: "12px", fontSize: 11 }}
        />
        <Legend wrapperStyle={{ fontSize: 10 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
