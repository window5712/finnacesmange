"use client";

import { useState } from "react";
import { Expense, formatCurrency, EXPENSE_CATEGORIES } from "@/types/finance";
import { RecordDrawer } from "./record-drawer";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { addExpense, updateExpense, deleteExpense } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "./page-header";
import { cn } from "@/lib/utils";

interface Props {
  expenses: Expense[];
}

const categoryColors: Record<string, string> = {
  office: "bg-blue-50 text-blue-700 border-blue-200",
  tools: "bg-purple-50 text-purple-700 border-purple-200",
  hosting: "bg-teal-50 text-teal-700 border-teal-200",
  marketing: "bg-amber-50 text-amber-700 border-amber-200",
  salaries: "bg-green-50 text-green-700 border-green-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
};

export function ExpensesClient({ expenses }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const filtered = filterCategory === "all" ? expenses : expenses.filter((e) => e.category === filterCategory);

  const handleEdit = (item: Expense) => {
    setEditItem(item);
    setDrawerOpen(true);
  };

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) return updateExpense(id, formData);
    return addExpense(formData);
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Expenses"
        subtitle={`${expenses.length} records · Total: ${formatCurrency(total)}`}
        icon="Receipt"
        action={
          <Button
            onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            className="bg-[#1A5C5A] hover:bg-[#154D4B] text-white"
          >
            <Plus size={16} className="mr-2" /> Add Expense
          </Button>
        }
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mt-5">
        <button
          onClick={() => setFilterCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
            filterCategory === "all" ? "bg-[#1A5C5A] text-white border-[#1A5C5A]" : "bg-white text-muted-foreground border-border hover:border-primary"
          )}
        >
          All ({expenses.length})
        </button>
        {EXPENSE_CATEGORIES.map((cat) => {
          const count = expenses.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                filterCategory === cat ? "bg-[#1A5C5A] text-white border-[#1A5C5A]" : "bg-white text-muted-foreground border-border hover:border-primary"
              )}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl card-shadow overflow-hidden mt-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No expense records found</p>
            <Button variant="outline" className="mt-4" onClick={() => { setEditItem(null); setDrawerOpen(true); }}>
              <Plus size={14} className="mr-2" /> Add your first expense
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Description</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-sm">{item.description}</p>
                      {item.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={cn("text-xs capitalize border", categoryColors[item.category] || categoryColors.other)} variant="outline">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-500 text-sm font-jetbrains">
                      -{formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{item.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { setDeleteId(item.id); setDeleteOpen(true); }}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/20">
                  <td colSpan={2} className="px-5 py-3 text-sm font-semibold">Total</td>
                  <td className="px-5 py-3 text-right font-bold text-red-500 font-jetbrains">{formatCurrency(filtered.reduce((s, e) => s + Number(e.amount), 0))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <RecordDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        type="expense"
        defaultValues={editItem ? {
          category: editItem.category,
          description: editItem.description,
          amount: editItem.amount,
          date: editItem.date,
          notes: editItem.notes || "",
        } : undefined}
        editId={editItem?.id}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={() => deleteExpense(deleteId!)}
        title="Delete Expense"
        description="This will permanently delete this expense record."
      />
    </div>
  );
}
