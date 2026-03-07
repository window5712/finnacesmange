"use client";

import { useState } from "react";
import { Income, formatCurrency } from "@/types/finance";
import { RecordDrawer } from "./record-drawer";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { addIncome, updateIncome, deleteIncome } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "./page-header";

interface Props {
  income: Income[];
}

export function IncomeClient({ income }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Income | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const total = income.reduce((s, i) => s + Number(i.amount), 0);

  const handleEdit = (item: Income) => {
    setEditItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) return updateIncome(id, formData);
    return addIncome(formData);
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Income"
        subtitle={`${income.length} records · Total: ${formatCurrency(total)}`}
        icon="TrendingUp"
        action={
          <Button
            onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            className="bg-[#1A5C5A] hover:bg-[#154D4B] text-white"
          >
            <Plus size={16} className="mr-2" /> Add Income
          </Button>
        }
      />

      <div className="bg-white rounded-2xl card-shadow overflow-hidden mt-6">
        {income.length === 0 ? (
          <div className="py-16 text-center">
            <TrendingUp size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No income records yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            >
              <Plus size={14} className="mr-2" /> Add your first income
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Method</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {income.map((item, i) => (
                  <tr key={item.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-sm">{item.project_name}</p>
                      {item.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.client_name}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {item.payment_method?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-600 text-sm font-jetbrains">
                      +{formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{item.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/20">
                  <td colSpan={3} className="px-5 py-3 text-sm font-semibold">Total</td>
                  <td className="px-5 py-3 text-right font-bold text-emerald-600 font-jetbrains">{formatCurrency(total)}</td>
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
        type="income"
        defaultValues={editItem ? {
          project_name: editItem.project_name,
          client_name: editItem.client_name,
          payment_method: editItem.payment_method,
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
        onConfirm={() => deleteIncome(deleteId!)}
        title="Delete Income Record"
        description="This will permanently delete this income record."
      />
    </div>
  );
}
