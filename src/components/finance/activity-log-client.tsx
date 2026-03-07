"use client";

import { useState } from "react";
import { ActivityLog } from "@/types/finance";
import { PageHeader } from "./page-header";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  logs: ActivityLog[];
}

const entityColors: Record<string, string> = {
  income: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expenses: "bg-amber-50 text-amber-700 border-amber-200",
  salaries: "bg-blue-50 text-blue-700 border-blue-200",
  investments: "bg-purple-50 text-purple-700 border-purple-200",
};

const actionColors: Record<string, string> = {
  Created: "bg-emerald-50 text-emerald-700",
  Updated: "bg-blue-50 text-blue-700",
  Deleted: "bg-red-50 text-red-600",
};

function getActionColor(action: string) {
  const key = Object.keys(actionColors).find((k) => action.includes(k));
  return key ? actionColors[key] : "bg-gray-50 text-gray-600";
}

export function ActivityLogClient({ logs }: Props) {
  const [filter, setFilter] = useState<"all" | "income" | "expenses" | "salaries" | "investments">("all");

  const filtered = filter === "all" ? logs : logs.filter((l) => l.entity_type === filter);

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Activity Log"
        subtitle={`${logs.length} total actions recorded`}
        icon={Activity}
      />

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mt-5">
        {(["all", "income", "expenses", "salaries", "investments"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
              filter === type
                ? "bg-[#1A5C5A] text-white border-[#1A5C5A]"
                : "bg-white text-muted-foreground border-border hover:border-primary"
            )}
          >
            {type === "all" ? `All (${logs.length})` : `${type} (${logs.filter((l) => l.entity_type === type).length})`}
          </button>
        ))}
      </div>

      <div className="mt-4 bg-white rounded-2xl card-shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Activity size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No activity logged yet</p>
            <p className="text-xs text-muted-foreground mt-1">Actions will appear here as you use the app</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", getActionColor(log.action))}>
                    {log.action.split(" ")[0]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{log.user_email}</span>
                    <span className="text-muted-foreground/30">·</span>
                    {log.entity_type && (
                      <Badge variant="outline" className={cn("text-[10px] capitalize", entityColors[log.entity_type] || "")}>
                        {log.entity_type}
                      </Badge>
                    )}
                    {log.details && typeof log.details === "object" && "amount" in log.details && (
                      <span className="text-xs font-medium text-muted-foreground">
                        ${Number(log.details.amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {new Date(log.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
