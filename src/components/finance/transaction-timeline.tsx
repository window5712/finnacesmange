"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Income, Expense, Salary, Investment, PartnerTransaction, formatCurrency 
} from "@/types/finance";
import { TrendingUp, Receipt, Users, PiggyBank, Building2, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineProps {
  income: Income[];
  expenses: Expense[];
  salaries: Salary[];
  investments: Investment[];
  partnerTx: PartnerTransaction[];
}

type TimelineItem = {
  id: string;
  type: string;
  date: string;
  amount: number;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  sign: "+" | "-";
};

export function TransactionTimeline({ income, expenses, salaries, investments, partnerTx }: TimelineProps) {
  const [filter, setFilter] = useState("all");

  const items: TimelineItem[] = useMemo(() => {
    const list: TimelineItem[] = [];

    income.forEach(i => list.push({
      id: `inc-${i.id}`, type: "income", date: i.date, amount: Number(i.amount),
      description: `${i.project_name} (${i.client_name})`,
      icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-700", sign: "+"
    }));

    expenses.forEach(e => list.push({
      id: `exp-${e.id}`, type: "expense", date: e.date, amount: Number(e.amount),
      description: e.description,
      icon: Receipt, iconBg: "bg-rose-100", iconColor: "text-rose-700", sign: "-"
    }));

    salaries.forEach(s => list.push({
      id: `sal-${s.id}`, type: "salary", date: s.payment_date, amount: Number(s.amount),
      description: `Salary: ${s.employee_name}`,
      icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-700", sign: "-"
    }));

    investments.forEach(i => list.push({
      id: `inv-${i.id}`, type: "investment", date: i.date, amount: Number(i.amount),
      description: `Investment: ${i.purpose}`,
      icon: PiggyBank, iconBg: "bg-amber-100", iconColor: "text-amber-700", sign: "-"
    }));

    partnerTx.forEach(p => list.push({
      id: `ptx-${p.id}`, type: `partner_${p.type}`, date: p.transaction_date, amount: Number(p.amount),
      description: `Partner ${p.type}`,
      icon: p.type === 'deposit' ? Building2 : CreditCard, 
      iconBg: p.type === 'deposit' ? "bg-indigo-100" : "bg-orange-100", 
      iconColor: p.type === 'deposit' ? "text-indigo-700" : "text-orange-700", 
      sign: p.type === 'deposit' ? "+" : "-"
    }));

    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [income, expenses, salaries, investments, partnerTx]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "inflows") return items.filter(i => i.sign === "+");
    if (filter === "outflows") return items.filter(i => i.sign === "-");
    return items.filter(i => i.type.includes(filter));
  }, [items, filter]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Money Flow Timeline</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Filter..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="inflows">All Inflows (+)</SelectItem>
            <SelectItem value="outflows">All Outflows (-)</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
            <SelectItem value="partner">Partner Activity</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-muted ml-3 mt-4 space-y-6 pb-4">
          {filteredItems.slice(0, 15).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative pl-6">
                <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-background ${item.iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-medium leading-none">{item.description}</h4>
                    <span className="text-xs text-muted-foreground capitalize mt-1 block">
                      {item.type.replace('_', ' ')} • {format(new Date(item.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <span className={`text-sm font-bold font-jetbrains ${item.sign === "+" ? "text-emerald-600" : "text-rose-600"}`}>
                    {item.sign}{formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {filteredItems.length > 15 && (
          <div className="text-center mt-4 text-xs text-muted-foreground">
            Showing latest 15 transactions
          </div>
        )}
      </CardContent>
    </Card>
  );
}
