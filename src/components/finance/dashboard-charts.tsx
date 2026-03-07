"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Income, Expense, Salary } from "@/types/finance";

interface Props {
  income: Income[];
  expenses: Expense[];
  salaries: Salary[];
}

const COLORS = ["#1A5C5A", "#E8A838", "#3B82F6", "#EF4444", "#8B5CF6", "#10B981"];

function getMonthlyData(income: Income[], expenses: Expense[], salaries: Salary[]) {
  const months: Record<string, { month: string; income: number; expenses: number; salaries: number }> = {};

  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }).reverse();

  last6.forEach((m) => {
    const label = new Date(m + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    months[m] = { month: label, income: 0, expenses: 0, salaries: 0 };
  });

  income.forEach((i) => {
    const key = i.date?.slice(0, 7);
    if (months[key]) months[key].income += Number(i.amount);
  });
  expenses.forEach((e) => {
    const key = e.date?.slice(0, 7);
    if (months[key]) months[key].expenses += Number(e.amount);
  });
  salaries.forEach((s) => {
    const key = s.payment_date?.slice(0, 7);
    if (months[key]) months[key].salaries += Number(s.amount);
  });

  return Object.values(months);
}

function getExpensesByCategory(expenses: Expense[]) {
  const cats: Record<string, number> = {};
  expenses.forEach((e) => {
    cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
  });
  return Object.entries(cats).map(([name, value]) => ({
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }));
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-3 border text-xs">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: PKR {entry.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ income, expenses, salaries }: Props) {
  const monthlyData = getMonthlyData(income, expenses, salaries);
  const expenseCategories = getExpensesByCategory(expenses);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Monthly Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 card-shadow">
        <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "Fraunces, serif" }}>
          Monthly Overview
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barGap={4}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `PKR ${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" name="Income" fill="#1A5C5A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#E8A838" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salaries" name="Salaries" fill="#93C5FD" radius={[4, 4, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Category Pie */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "Fraunces, serif" }}>
          Expense Breakdown
        </h3>
        <p className="text-xs text-muted-foreground mb-4">By category</p>
        {expenseCategories.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-xs text-muted-foreground">No expense data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {expenseCategories.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`PKR ${v.toLocaleString()}`, ""]}
                contentStyle={{ borderRadius: "12px", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
