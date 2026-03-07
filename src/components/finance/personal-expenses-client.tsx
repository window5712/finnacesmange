"use client";

import { useState } from "react";
import { PersonalExpense, formatCurrency } from "@/types/finance";
import { PersonalRecordDrawer } from "./personal-record-drawer";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { addPersonalExpense, updatePersonalExpense, deletePersonalExpense } from "@/app/dashboard/personal/actions";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Wallet, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "./page-header";

interface Props {
  expenses: PersonalExpense[];
}

export function PersonalExpensesClient({ expenses }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<PersonalExpense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const handleEdit = (item: PersonalExpense) => {
    setEditItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) return updatePersonalExpense(id, formData);
    return addPersonalExpense(formData);
  };

  const categoryColors: Record<string, string> = {
    food: "bg-orange-100 text-orange-700",
    transport: "bg-blue-100 text-blue-700",
    housing: "bg-teal-100 text-teal-700",
    utilities: "bg-yellow-100 text-yellow-700",
    entertainment: "bg-pink-100 text-pink-700",
    healthcare: "bg-red-100 text-red-700",
    education: "bg-indigo-100 text-indigo-700",
    shopping: "bg-purple-100 text-purple-700",
    subscriptions: "bg-cyan-100 text-cyan-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="My Expenses"
        subtitle={`${expenses.length} records · Total: ${formatCurrency(total)}`}
        icon={Wallet}
        action={
          <Button
            onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus size={16} className="mr-2" /> Add Expense
          </Button>
        }
      />

      <div className="bg-white rounded-2xl card-shadow overflow-hidden mt-6">
        {expenses.length === 0 ? (
          <div className="py-16 text-center">
            <Wallet size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No personal expense records yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            >
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
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Method</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Recurring</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item, i) => (
                  <tr key={item.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-sm">{item.description}</p>
                      {item.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={`text-xs capitalize border-0 ${categoryColors[item.category] || categoryColors.other}`}>
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {item.payment_method?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-500 text-sm font-jetbrains">
                      -{formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{item.date}</td>
                    <td className="px-5 py-3.5 text-center">
                      {item.is_recurring && <RefreshCw size={14} className="inline text-violet-500" />}
                    </td>
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
                  <td className="px-5 py-3 text-right font-bold text-red-500 font-jetbrains">{formatCurrency(total)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <PersonalRecordDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        type="personal_expense"
        defaultValues={editItem ? {
          description: editItem.description,
          amount: editItem.amount,
          date: editItem.date,
          category: editItem.category,
          payment_method: editItem.payment_method,
          is_recurring: editItem.is_recurring,
          notes: editItem.notes || "",
        } : undefined}
        editId={editItem?.id}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={() => deletePersonalExpense(deleteId!)}
        title="Delete Personal Expense"
        description="This will permanently delete this personal expense record."
      />
    </div>
  );
}
