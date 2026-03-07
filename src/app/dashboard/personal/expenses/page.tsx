import { createClient } from "../../../../../supabase/server";
import { PersonalExpensesClient } from "@/components/finance/personal-expenses-client";

export default async function PersonalExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: expenses } = await supabase
    .from("personal_expenses")
    .select("*")
    .eq("user_id", user!.id)
    .order("date", { ascending: false });

  return <PersonalExpensesClient expenses={expenses || []} />;
}
