import { createClient } from "../../../../supabase/server";
import { TransactionHistoryClient } from "@/components/finance/transaction-history-client";
import { Income, Expense, Salary, Investment } from "@/types/finance";

export default async function TransactionHistoryPage() {
  const supabase = await createClient();

  const [incomeRes, expensesRes, salariesRes, investmentsRes] = await Promise.all([
    supabase.from("income").select("*").order("date", { ascending: false }),
    supabase.from("expenses").select("*").order("date", { ascending: false }),
    supabase.from("salaries").select("*").order("payment_date", { ascending: false }),
    supabase.from("investments").select("*").order("date", { ascending: false }),
  ]);

  // Combine into unified transaction list
  const transactions = [
    ...(incomeRes.data || []).map((i: Income) => ({
      id: i.id,
      type: "income" as const,
      title: i.project_name,
      subtitle: i.client_name,
      amount: i.amount,
      date: i.date,
      category: i.payment_method,
      created_at: i.created_at,
    })),
    ...(expensesRes.data || []).map((e: Expense) => ({
      id: e.id,
      type: "expense" as const,
      title: e.description,
      subtitle: e.category,
      amount: -e.amount,
      date: e.date,
      category: e.category,
      created_at: e.created_at,
    })),
    ...(salariesRes.data || []).map((s: Salary) => ({
      id: s.id,
      type: "salary" as const,
      title: s.employee_name,
      subtitle: s.position,
      amount: -s.amount,
      date: s.payment_date,
      category: "salary",
      created_at: s.created_at,
    })),
    ...(investmentsRes.data || []).map((i: Investment) => ({
      id: i.id,
      type: "investment" as const,
      title: i.purpose,
      subtitle: "Investment Reserve",
      amount: -i.amount,
      date: i.date,
      category: "investment",
      created_at: i.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <TransactionHistoryClient transactions={transactions} />;
}
