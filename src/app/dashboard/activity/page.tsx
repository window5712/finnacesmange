import { createClient } from "../../../../supabase/server";
import { ActivityLogClient } from "@/components/finance/activity-log-client";

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return <ActivityLogClient logs={logs || []} />;
}
