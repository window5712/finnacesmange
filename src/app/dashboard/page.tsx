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
import { DashboardFilters } from "@/components/finance/dashboard-filters";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function DashboardPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
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

  // All-time summary
  const summary = calculateFinanceSummary(income, expenses, salaries, investments, partnerTx);

  const totalPartnerDeposits = summary.totalPartnerDeposits;
  const totalPartnerWithdrawals = summary.totalPartnerWithdrawals;

  // Parse filters
  const timeframe = searchParams.timeframe || "this_month";
  let startDate: string | null = null;
  let endDate: string | null = null;
  let periodLabel = "This Month";

  if (timeframe === "custom") {
    startDate = searchParams.start || null;
    endDate = searchParams.end || null;
    if (startDate && endDate) {
      periodLabel = `${startDate} to ${endDate}`;
    } else {
      periodLabel = "Custom Period";
    }
  } else if (timeframe === "this_month") {
    const start = new Date(); start.setDate(1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
    periodLabel = "This Month";
  } else if (timeframe === "last_month") {
    const start = new Date(); start.setMonth(start.getMonth() - 1); start.setDate(1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
    periodLabel = "Last Month";
  } else if (timeframe === "this_year") {
    const start = new Date(); start.setMonth(0); start.setDate(1);
    const end = new Date(start.getFullYear(), 11, 31);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
    periodLabel = "This Year";
  } else if (timeframe === "all_time") {
    periodLabel = "All Time";
  }

  // Filtered helpers
  const isDateInRange = (dateStr: string) => {
    if (!startDate || !endDate) return true;
    return dateStr >= startDate && dateStr <= endDate;
  };

  const filteredIncome = income.filter((i) => isDateInRange(i.date));
  const filteredExpenses = expenses.filter((e) => isDateInRange(e.date));
  const filteredSalaries = salaries.filter((s) => isDateInRange(s.payment_date));
  const filteredInvestments = investments.filter((inv) => isDateInRange(inv.date));
  const filteredPartnerTx = partnerTx.filter((p) => isDateInRange(p.transaction_date));

  const periodIncome = filteredIncome.reduce((sum, i) => sum + Number(i.amount), 0);
  const periodExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const periodSalaries = filteredSalaries.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
            Finance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <DashboardFilters />

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{periodLabel}</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Income" value={periodIncome} icon="TrendingUp" variant="teal" delay={0} />
          <StatCard title="Expenses" value={periodExpenses} icon="Receipt" delay={1} iconBg="bg-amber-50" iconColor="text-amber-600" />
          <StatCard title="Salaries Paid" value={periodSalaries} icon="Users" delay={2} iconBg="bg-blue-50" iconColor="text-blue-600" />
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
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">All-Time Profit Distribution</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Gross Profit" value={summary.grossProfit} icon="TrendingUp" delay={6} iconBg="bg-teal-50" iconColor="text-teal-700" />
          <StatCard title="Charity (5%)" value={summary.charity} icon="Heart" variant="amber" delay={7} />
          
          {/* Partner Shares - Subtracting their specific withdrawals would be ideal, but for the dashboard overview we show the base share minus total withdrawals split or just the raw share */}
          <StatCard 
            title="Yassen's Share (47.5%)" 
            value={summary.partnerShare - (partnerTx.filter(t => t.partner_id === users.find(u => u.email.includes('yassen'))?.id && t.type === 'withdrawal').reduce((s, t) => s + Number(t.amount), 0))} 
            icon="User" delay={8} iconBg="bg-violet-50" iconColor="text-violet-600" 
          />
          <StatCard 
            title="Aryan's Share (47.5%)" 
            value={summary.partnerShare - (partnerTx.filter(t => t.partner_id === users.find(u => u.email.includes('aryan'))?.id && t.type === 'withdrawal').reduce((s, t) => s + Number(t.amount), 0))} 
            icon="User" delay={9} iconBg="bg-indigo-50" iconColor="text-indigo-600" 
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard title="Investment Reserve" value={summary.totalInvestments} icon="PiggyBank" delay={10} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Partner Withdrawals" value={totalPartnerWithdrawals} icon="Building2" delay={10.5} variant="red" />
        <StatCard title="Company Budget (Net Distributable)" value={summary.netDistributable} icon="Building2" delay={11} iconBg="bg-teal-50" iconColor="text-teal-700" />
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Analytics Overview ({periodLabel})</p>
        <DashboardCharts income={filteredIncome} expenses={filteredExpenses} salaries={filteredSalaries} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>Recent Income ({periodLabel})</h3>
          {filteredIncome.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No income records yet</p>
          ) : (
            <div className="space-y-3">
              {filteredIncome.slice(0, 5).map((item) => (
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
          <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>Recent Expenses ({periodLabel})</h3>
          {filteredExpenses.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No expense records yet</p>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.slice(0, 5).map((item) => (
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
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Transaction Timeline ({periodLabel})</p>
        <TransactionTimeline 
          income={filteredIncome} 
          expenses={filteredExpenses} 
          salaries={filteredSalaries} 
          investments={filteredInvestments} 
          partnerTx={filteredPartnerTx} 
        />
      </div>
    </div>
  );
}
