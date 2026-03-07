import { createClient } from "../../../../supabase/server";
import { InvestmentsClient } from "@/components/finance/investments-client";

export default async function InvestmentsPage() {
  const supabase = await createClient();
  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .order("date", { ascending: false });

  return <InvestmentsClient investments={investments || []} />;
}
