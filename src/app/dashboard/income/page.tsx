import { createClient } from "../../../../supabase/server";
import { IncomeClient } from "@/components/finance/income-client";

export default async function IncomePage() {
  const supabase = await createClient();
  const { data: income } = await supabase
    .from("income")
    .select("*")
    .order("date", { ascending: false });

  return <IncomeClient income={income || []} />;
}
