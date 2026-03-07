"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";
import { Income, Expense, Salary, Investment, formatCurrency } from "@/types/finance";
import { PageHeader } from "./page-header";
import { BarChart3 } from "lucide-react";

interface Props {
  income: Income[];
  expenses: Expense[];
  salaries: Salary[];
  investments: Investment[];
}

function buildMonthlyData(income: Income[], expenses: Expense[], salaries: Salary[]) {
  const map: Record<string, { month: string; income: number; expenses: number; salaries: number; profit: number }> = {};

  const allDates = [
    ...income.map((i) => i.date),
    ...expenses.map((e) => e.date),
    ...salaries.map((s) => s.payment_date),
  ].filter(Boolean);

  const uniqueMonths = [...new Set(allDates.map((d) => d.slice(0, 7)))].sort();

  uniqueMonths.forEach((m) => {
    const label = new Date(m + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" });
    map[m] = { month: label, income: 0, expenses: 0, salaries: 0, profit: 0 };
  });

  income.forEach((i) => {
    const key = i.date?.slice(0, 7);
    if (map[key]) map[key].income += Number(i.amount);
  });
  expenses.forEach((e) => {
    const key = e.date?.slice(0, 7);
    if (map[key]) map[key].expenses += Number(e.amount);
  });
  salaries.forEach((s) => {
    const key = s.payment_date?.slice(0, 7);
    if (map[key]) map[key].salaries += Number(s.amount);
  });

  Object.values(map).forEach((m) => {
    m.profit = m.income - m.expenses - m.salaries;
  });

  return Object.values(map);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-3 border text-xs">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ReportsClient({ income, expenses, salaries }: Props) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const monthlyData = buildMonthlyData(income, expenses, salaries);

  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalSalaries = salaries.reduce((s, s2) => s + Number(s2.amount), 0);
  const totalProfit = totalIncome - totalExpenses - totalSalaries;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Reports & Analytics" subtitle="Financial performance overview" icon={BarChart3} />
        <div className="flex gap-2 bg-white rounded-lg border p-1">
          {(["monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                period === p ? "bg-[#1A5C5A] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Income", value: totalIncome, color: "text-emerald-600" },
          { label: "Total Expenses", value: totalExpenses, color: "text-red-500" },
          { label: "Total Salaries", value: totalSalaries, color: "text-blue-500" },
          { label: "Net Profit", value: totalProfit, color: totalProfit >= 0 ? "text-[#1A5C5A]" : "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 card-shadow">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-xl font-bold stat-number ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Monthly Revenue vs Expenses Bar Chart */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>
            Revenue vs Expenses
          </h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-sm text-muted-foreground">Add records to see chart data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="income" name="Income" fill="#1A5C5A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#E8A838" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salaries" name="Salaries" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Profit Trend Line Chart */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>
            Profit Trend
          </h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-sm text-muted-foreground">Add records to see chart data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#1A5C5A" strokeWidth={2.5} dot={{ fill: "#1A5C5A", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Income Growth Area Chart */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>
            Income Growth
          </h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-sm text-muted-foreground">Add records to see chart data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A5C5A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1A5C5A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#1A5C5A" strokeWidth={2} fill="url(#incomeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
