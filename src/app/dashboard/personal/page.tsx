import { createClient } from "../../../../supabase/server";
import { StatCard } from "@/components/finance/stat-card";
import { calculatePersonalSummary, formatCurrency } from "@/types/finance";
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";
import Link from "next/link";

export default async function PersonalDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [incomeRes, expensesRes, savingsRes] = await Promise.all([
    supabase.from("personal_income").select("*").eq("user_id", user!.id).order("date", { ascending: false }),
    supabase.from("personal_expenses").select("*").eq("user_id", user!.id).order("date", { ascending: false }),
    supabase.from("personal_savings_goals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  const income = incomeRes.data || [];
  const expenses = expensesRes.data || [];
  const savings = savingsRes.data || [];

  const summary = calculatePersonalSummary(income, expenses, savings);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <User size={18} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
              Personal Finance
            </h1>
            <p className="text-muted-foreground text-sm">
              Your personal income, expenses & savings goals
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">This Month</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Monthly Income" value={summary.monthlyIncome} icon={TrendingUp} delay={0} iconBg="bg-violet-50" iconColor="text-violet-600" />
          <StatCard title="Monthly Expenses" value={summary.monthlyExpenses} icon={Wallet} delay={1} iconBg="bg-pink-50" iconColor="text-pink-600" />
          <StatCard
            title="Monthly Net"
            value={summary.monthlyIncome - summary.monthlyExpenses}
            icon={summary.monthlyIncome >= summary.monthlyExpenses ? ArrowUpRight : ArrowDownRight}
            delay={2}
            variant={summary.monthlyIncome >= summary.monthlyExpenses ? "green" : "red"}
          />
        </div>
      </div>

      <div className="mb-3 mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Overall</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Income" value={summary.totalIncome} icon={TrendingUp} delay={3} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard title="Total Expenses" value={summary.totalExpenses} icon={Wallet} variant="red" delay={4} />
          <StatCard title="Net Balance" value={summary.netBalance} icon={PiggyBank} variant={summary.netBalance >= 0 ? "green" : "red"} delay={5} />
          <StatCard title="Total Saved" value={summary.totalSaved} icon={Target} delay={6} iconBg="bg-violet-50" iconColor="text-violet-600" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ fontFamily: "Fraunces, serif" }}>Recent Income</h3>
            <Link href="/dashboard/personal/income" className="text-xs text-violet-600 hover:underline">View all →</Link>
          </div>
          {income.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No personal income yet</p>
          ) : (
            <div className="space-y-3">
              {income.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.source}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category} · {item.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 font-jetbrains">+{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ fontFamily: "Fraunces, serif" }}>Recent Expenses</h3>
            <Link href="/dashboard/personal/expenses" className="text-xs text-violet-600 hover:underline">View all →</Link>
          </div>
          {expenses.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No personal expenses yet</p>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category} · {item.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 font-jetbrains">-{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Savings Goals */}
      {savings.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Savings Goals</p>
            <Link href="/dashboard/personal/savings" className="text-xs text-violet-600 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savings.slice(0, 3).map((goal) => {
              const progress = goal.target_amount > 0
                ? Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100)
                : 0;
              return (
                <div key={goal.id} className="bg-white rounded-2xl p-5 card-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{goal.name}</h4>
                    <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(goal.current_amount)}</span>
                    <span>{formatCurrency(goal.target_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
