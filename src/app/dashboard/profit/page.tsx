import { createClient } from "../../../../supabase/server";
import { calculateFinanceSummary, formatCurrency } from "@/types/finance";
import { ProfitChart } from "@/components/finance/profit-chart";
import { PageHeader } from "@/components/finance/page-header";
import { PieChart } from "lucide-react";

export default async function ProfitPage() {
  const supabase = await createClient();

  const [incomeRes, expensesRes, salariesRes, investmentsRes] = await Promise.all([
    supabase.from("income").select("*"),
    supabase.from("expenses").select("*"),
    supabase.from("salaries").select("*"),
    supabase.from("investments").select("*"),
  ]);

  const summary = calculateFinanceSummary(
    incomeRes.data || [],
    expensesRes.data || [],
    salariesRes.data || [],
    investmentsRes.data || []
  );

  const steps = [
    {
      label: "Total Income",
      value: summary.totalIncome,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      description: "Gross revenue from all projects",
    },
    {
      label: "− Total Expenses",
      value: -summary.totalExpenses,
      color: "bg-red-400",
      textColor: "text-red-500",
      description: "Operating costs and overheads",
    },
    {
      label: "− Total Salaries",
      value: -summary.totalSalaries,
      color: "bg-blue-400",
      textColor: "text-blue-500",
      description: "Employee salary payments",
    },
    {
      label: "= Gross Profit",
      value: summary.grossProfit,
      color: "bg-[#1A5C5A]",
      textColor: "text-[#1A5C5A]",
      description: "Income minus expenses and salaries",
      highlight: true,
    },
    {
      label: "− Charity (5%)",
      value: -summary.charity,
      color: "bg-amber-400",
      textColor: "text-amber-600",
      description: "5% of gross profit for charitable giving",
    },
    {
      label: "− Investment Reserve",
      value: -summary.totalInvestments,
      color: "bg-purple-400",
      textColor: "text-purple-600",
      description: "Funds set aside for reinvestment",
    },
    {
      label: "= Net Distributable",
      value: summary.netDistributable,
      color: "bg-teal-500",
      textColor: "text-teal-600",
      description: "Available for partner distribution",
      highlight: true,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Profit Distribution"
        subtitle="Auto-calculated breakdown of profit sharing"
        icon="PieChart"
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waterfall Breakdown */}
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h3 className="font-semibold text-sm mb-5" style={{ fontFamily: "Fraunces, serif" }}>
            Profit Calculation Waterfall
          </h3>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 ${step.highlight ? "ring-2 ring-primary/20 bg-primary/5" : "bg-muted/30"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                    <div>
                      <p className={`text-sm font-semibold ${step.highlight ? "" : ""}`}>{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <p className={`text-base font-bold font-jetbrains ${step.textColor}`}>
                    {step.value < 0 ? `-${formatCurrency(Math.abs(step.value))}` : formatCurrency(step.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Distribution & Chart */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>
              Partner Shares
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-700">Y</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Yassen</p>
                    <p className="text-xs text-muted-foreground">47.5% of net distributable</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-violet-700 stat-number">{formatCurrency(summary.partnerShare)}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-700">A</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Aryan</p>
                    <p className="text-xs text-muted-foreground">47.5% of net distributable</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-indigo-700 stat-number">{formatCurrency(summary.partnerShare)}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-700">♥</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Charity</p>
                    <p className="text-xs text-muted-foreground">5% of gross profit</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-amber-600 stat-number">{formatCurrency(summary.charity)}</p>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: "Fraunces, serif" }}>
              Distribution Visualization
            </h3>
            <ProfitChart summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
}
