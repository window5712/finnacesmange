import { createClient } from "../../../../../supabase/server";
import { SavingsGoalsClient } from "@/components/finance/savings-goals-client";

export default async function SavingsGoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from("personal_savings_goals")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <SavingsGoalsClient goals={goals || []} />;
}
