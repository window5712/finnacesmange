import { createClient } from "../../../../supabase/server";
import { SalariesClient } from "@/components/finance/salaries-client";

export default async function SalariesPage() {
  const supabase = await createClient();
  const { data: salaries } = await supabase
    .from("salaries")
    .select("*")
    .order("payment_date", { ascending: false });

  return <SalariesClient salaries={salaries || []} />;
}
