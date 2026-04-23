import { createClient } from "@supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/types/finance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default async function PartnerPersonalViewPage({
  params,
}: {
  params: { partnerId: string };
}) {
  const supabase = await createClient();

  // Validate session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  // Get Partner details
  const { data: partnerData, error: partnerError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("id", params.partnerId)
    .single();

  if (partnerError || !partnerData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Partner not found</h1>
        <p className="text-muted-foreground mt-2">The partner ID provided does not exist.</p>
      </div>
    );
  }

  // Get transactions
  const { data: transactions, error: txError } = await supabase
    .from("partner_transactions")
    .select("*")
    .eq("partner_id", params.partnerId)
    .order("transaction_date", { ascending: false });

  const txList = transactions || [];

  const totalDeposits = txList
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawals = txList
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalInvestments = txList
    .filter((t) => t.type === "investment")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentBalance = totalDeposits - totalWithdrawals;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
          {partnerData.email.split('@')[0]}'s Contributions
        </h1>
        <p className="text-muted-foreground text-sm">
          Overview of company wallet interactions for this partner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Total Sent (Deposits)</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-jetbrains">
              {formatCurrency(totalDeposits)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400">Total Received (Withdrawals)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900 dark:text-rose-100 font-jetbrains">
              {formatCurrency(totalWithdrawals)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
          <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Current Balance</CardTitle>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 font-jetbrains">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Investments: {formatCurrency(totalInvestments)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mt-8">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {txList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted-foreground">No transactions found</td>
                  </tr>
                ) : txList.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3">{tx.transaction_date}</td>
                    <td className="px-4 py-3 capitalize font-medium
                      ${tx.type === 'deposit' ? 'text-indigo-600' : tx.type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600'}"
                    >
                      {tx.type}
                    </td>
                    <td className="px-4 py-3 text-right font-jetbrains font-bold text-foreground">
                      {formatCurrency(Number(tx.amount))}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{tx.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
