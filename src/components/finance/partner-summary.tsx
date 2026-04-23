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
    const data: Record<string, { email: string, currentMonth: number, prevMonth: number, total: number }> = {};
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

    partners.forEach(p => {
      data[p.id] = { email: p.email, currentMonth: 0, prevMonth: 0, total: 0 };
    });

    transactions.forEach(t => {
      if (t.type !== 'deposit') return; // Focus on contributions here
      
      if (!data[t.partner_id]) {
        data[t.partner_id] = { email: t.partner_id, currentMonth: 0, prevMonth: 0, total: 0 };
      }

      const amount = Number(t.amount);
      const tMonth = t.transaction_date.substring(0, 7);

      data[t.partner_id].total += amount;
      if (tMonth === currentMonthStr) {
        data[t.partner_id].currentMonth += amount;
      } else if (tMonth === prevMonthStr) {
        data[t.partner_id].prevMonth += amount;
      }
    });

    return Object.values(data);
  }, [transactions, partners]);

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Partner Summary (Deposits)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Partner</th>
                <th className="px-4 py-3 font-medium text-right">This Month</th>
                <th className="px-4 py-3 font-medium text-right">Last Month</th>
                <th className="px-4 py-3 font-medium text-right">Total Contributions</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No data available</td></tr>
              ) : summaryData.map((row) => (
                <tr key={row.email} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 font-medium">{row.email}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.currentMonth)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.prevMonth)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
