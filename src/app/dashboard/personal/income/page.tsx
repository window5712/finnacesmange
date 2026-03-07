import { createClient } from "../../../../../supabase/server";
import { PersonalIncomeClient } from "@/components/finance/personal-income-client";

export default async function PersonalIncomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: income } = await supabase
    .from("personal_income")
    .select("*")
    .eq("user_id", user!.id)
    .order("date", { ascending: false });

  return <PersonalIncomeClient income={income || []} />;
}
