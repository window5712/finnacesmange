import { createClient } from "../../../../supabase/server";
import { ExpensesClient } from "@/components/finance/expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  return <ExpensesClient expenses={expenses || []} />;
}
