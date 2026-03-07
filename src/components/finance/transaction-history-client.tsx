"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/types/finance";
import { PageHeader } from "./page-header";
import { History, Search, TrendingUp, Receipt, Users, PiggyBank } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TransactionType = "income" | "expense" | "salary" | "investment";

interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  category: string;
  created_at: string;
}

interface Props {
  transactions: Transaction[];
}

const typeConfig: Record<TransactionType, { icon: React.ComponentType<{ size: number; className?: string }>; color: string; bg: string; label: string }> = {
  income: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", label: "Income" },
  expense: { icon: Receipt, color: "text-red-500", bg: "bg-red-50", label: "Expense" },
  salary: { icon: Users, color: "text-blue-500", bg: "bg-blue-50", label: "Salary" },
  investment: { icon: PiggyBank, color: "text-purple-500", bg: "bg-purple-50", label: "Investment" },
};

export function TransactionHistoryClient({ transactions }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === "all" || t.type === typeFilter;

      const matchDate =
        (!dateFrom || t.date >= dateFrom) &&
        (!dateTo || t.date <= dateTo);

      return matchSearch && matchType && matchDate;
    });
  }, [transactions, search, typeFilter, dateFrom, dateTo]);

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Transaction History"
        subtitle={`${filtered.length} of ${transactions.length} transactions`}
        icon={History}
      />

      {/* Filters */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-white w-36"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-white w-36"
            placeholder="To"
          />
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap gap-2 mt-3">
        {(["all", "income", "expense", "salary", "investment"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
              typeFilter === type
                ? "bg-[#1A5C5A] text-white border-[#1A5C5A]"
                : "bg-white text-muted-foreground border-border hover:border-primary"
            )}
          >
            {type === "all" ? `All (${transactions.length})` : `${typeConfig[type].label} (${transactions.filter((t) => t.type === type).length})`}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="mt-4 bg-white rounded-2xl card-shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <History size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((t) => {
              const config = typeConfig[t.type];
              const Icon = config.icon;
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground truncate capitalize">{t.subtitle} · {t.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn("text-sm font-semibold font-jetbrains", t.amount >= 0 ? "text-emerald-600" : "text-red-500")}>
                      {t.amount >= 0 ? "+" : ""}{formatCurrency(t.amount)}
                    </p>
                    <Badge variant="outline" className={cn("text-[10px] mt-0.5", config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
