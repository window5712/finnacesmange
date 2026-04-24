"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PartnerTransaction, formatCurrency } from "@/types/finance";

interface PartnerSummaryProps {
  transactions: PartnerTransaction[];
  partners: { id: string; email: string }[];
}

export function PartnerSummary({ transactions, partners }: PartnerSummaryProps) {
  const summaryData = useMemo(() => {
    const data: Record<string, { email: string, deposits: number, withdrawals: number }> = {};
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

    partners.forEach(p => {
      data[p.id] = { email: p.email, deposits: 0, withdrawals: 0 };
    });

    transactions.forEach(t => {
      if (!data[t.partner_id]) {
        data[t.partner_id] = { email: t.partner_id, deposits: 0, withdrawals: 0 };
      }

      const amount = Number(t.amount);
      if (t.type === 'deposit') {
        data[t.partner_id].deposits += amount;
      } else if (t.type === 'withdrawal') {
        data[t.partner_id].withdrawals += amount;
      }
    });

    return Object.values(data);
  }, [transactions, partners]);

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Partner Shares & Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Partner</th>
                <th className="px-4 py-3 font-medium text-right">Total Deposits</th>
                <th className="px-4 py-3 font-medium text-right">Total Withdrawals</th>
                <th className="px-4 py-3 font-medium text-right font-bold text-indigo-600">Net Contribution</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No data available</td></tr>
              ) : (summaryData as any[]).map((row) => (
                <tr key={row.email} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 font-medium">{row.email}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">+{formatCurrency(row.deposits)}</td>
                  <td className="px-4 py-3 text-right text-rose-600">-{formatCurrency(row.withdrawals)}</td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-600">{formatCurrency(row.deposits - row.withdrawals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
