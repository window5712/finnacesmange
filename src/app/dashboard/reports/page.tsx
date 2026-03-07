import { createClient } from "../../../../supabase/server";
import { ReportsClient } from "@/components/finance/reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [incomeRes, expensesRes, salariesRes, investmentsRes] = await Promise.all([
    supabase.from("income").select("*").order("date", { ascending: true }),
    supabase.from("expenses").select("*").order("date", { ascending: true }),
    supabase.from("salaries").select("*").order("payment_date", { ascending: true }),
    supabase.from("investments").select("*").order("date", { ascending: true }),
  ]);

  return (
    <ReportsClient
      income={incomeRes.data || []}
      expenses={expensesRes.data || []}
      salaries={salariesRes.data || []}
      investments={investmentsRes.data || []}
    />
  );
}
