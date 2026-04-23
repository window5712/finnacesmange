import { createClient } from "@supabase/server";
import { StatCard } from "@/components/finance/stat-card";
import { calculateFinanceSummary, formatCurrency } from "@/types/finance";
import {
  TrendingUp,
  Receipt,
  Users,
  Wallet,
  PiggyBank,
  Heart,
  User,
  BarChart3,
  Building2,
} from "lucide-react";
import { DashboardCharts } from "@/components/finance/dashboard-charts";
import CompanyWallet from "@/components/layout/CompanyWallet";
import { PartnerSummary } from "@/components/finance/partner-summary";
import { TransactionTimeline } from "@/components/finance/transaction-timeline";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [incomeRes, expensesRes, salariesRes, investmentsRes, partnerRes, usersRes] = await Promise.all([
    supabase.from("income").select("*").order("date", { ascending: false }),
    supabase.from("expenses").select("*").order("date", { ascending: false }),
    supabase.from("salaries").select("*").order("payment_date", { ascending: false }),
    supabase.from("investments").select("*").order("date", { ascending: false }),
    supabase.from("partner_transactions").select("*").order("transaction_date", { ascending: false }),
    supabase.from("users").select("id, email, role")
  ]);

  const income = incomeRes.data || [];
  const expenses = expensesRes.data || [];
  const salaries = salariesRes.data || [];
  const investments = investmentsRes.data || [];
  const partnerTx = partnerRes.data || [];
  const users = usersRes.data || [];

  const summary = calculateFinanceSummary(income, expenses, salaries, investments);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyIncome = income
    .filter((i) => i.date?.startsWith(currentMonth))
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const monthlyExpenses = expenses
    .filter((e) => e.date?.startsWith(currentMonth))
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const monthlySalaries = salaries
    .filter((s) => s.payment_date?.startsWith(currentMonth))
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const totalPartnerDeposits = partnerTx
    .filter((p) => p.type === 'deposit')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
          Finance Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">This Month</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Monthly Income" value={monthlyIncome} icon="TrendingUp" variant="teal" delay={0} />
          <StatCard title="Monthly Expenses" value={monthlyExpenses} icon="Receipt" delay={1} iconBg="bg-amber-50" iconColor="text-amber-600" />
          <StatCard title="Salaries Paid" value={monthlySalaries} icon="Users" delay={2} iconBg="bg-blue-50" iconColor="text-blue-600" />
        </div>
      </div>

      <div className="mb-3 mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Overall Balance</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Income" value={summary.totalIncome} icon="BarChart3" variant="green" delay={3} />
          <StatCard title="Total Expenses" value={summary.totalExpenses} icon="Receipt" variant="red" delay={4} />
          <StatCard title="Partner Deposits" value={totalPartnerDeposits} icon="Building2" variant="teal" delay={5} />
          <StatCard title="Estimated Net" value={summary.remainingBalance} icon="Wallet" variant={summary.remainingBalance >= 0 ? "default" : "red"} delay={6} />
        </div>
      </div>
      
      <div className="mt-6 mb-3">
        <CompanyWallet />
      </div>

      <div className="mt-6 mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Profit Distribution</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Gross Profit" value={summary.grossProfit} icon="TrendingUp" delay={6} iconBg="bg-teal-50" iconColor="text-teal-700" />
          <StatCard title="Charity (5%)" value={summary.charity} icon="Heart" variant="amber" delay={7} />
          <StatCard title="Yassen's Share (47.5%)" value={summary.partnerShare} icon="User" delay={8} iconBg="bg-violet-50" iconColor="text-violet-600" />
          <StatCard title="Aryan's Share (47.5%)" value={summary.partnerShare} icon="User" delay={9} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard title="Investment Reserve" value={summary.totalInvestments} icon="PiggyBank" delay={10} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Company Budget (Net Distributable)" value={summary.netDistributable} icon="Building2" delay={11} iconBg="bg-teal-50" iconColor="text-teal-700" />
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Analytics Overview</p>
        <DashboardCharts income={income} expenses={expenses} salaries={salaries} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>Recent Income</h3>
          {income.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No income records yet</p>
          ) : (
            <div className="space-y-3">
              {income.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.project_name}</p>
                    <p className="text-xs text-muted-foreground">{item.client_name} · {item.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 font-jetbrains">+{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>Recent Expenses</h3>
          {expenses.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No expense records yet</p>
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

      <PartnerSummary transactions={partnerTx} partners={users} />

      <div className="mt-8">
        <TransactionTimeline 
          income={income} 
          expenses={expenses} 
          salaries={salaries} 
          investments={investments} 
          partnerTx={partnerTx} 
        />
      </div>
    </div>
  );
}
