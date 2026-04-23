import { createClient } from "@supabase/server";
import { redirect } from "next/navigation";
import { PartnerTransactionsClient } from "@/components/finance/partner-transactions-client";

export default async function PartnerTransactionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user role/details
  const { data: users, error: usersError } = await supabase.from("users").select("id, email, role");
  
  const { data, error } = await supabase
    .from("partner_transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

  if (error) {
    console.error("Error fetching partner transactions:", error);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
          Partner Wallet
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage partner deposits, withdrawals, and investments to the company wallet.
        </p>
      </div>

      <PartnerTransactionsClient 
        initialData={data || []} 
        partners={users || [{ id: user.id, email: user.email! }]}
      />
    </div>
  );
}
