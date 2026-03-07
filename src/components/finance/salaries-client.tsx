"use client";

import { useState } from "react";
import { Salary, formatCurrency } from "@/types/finance";
import { RecordDrawer } from "./record-drawer";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { addSalary, updateSalary, deleteSalary } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { PageHeader } from "./page-header";

interface Props {
  salaries: Salary[];
}

export function SalariesClient({ salaries }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Salary | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const total = salaries.reduce((s, sal) => s + Number(sal.amount), 0);

  const handleEdit = (item: Salary) => {
    setEditItem(item);
    setDrawerOpen(true);
  };

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) return updateSalary(id, formData);
    return addSalary(formData);
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Salaries"
        subtitle={`${salaries.length} records · Total: ${formatCurrency(total)}`}
        icon="Users"
        action={
          <Button
            onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            className="bg-[#1A5C5A] hover:bg-[#154D4B] text-white"
          >
            <Plus size={16} className="mr-2" /> Add Salary
          </Button>
        }
      />

      <div className="bg-white rounded-2xl card-shadow overflow-hidden mt-6">
        {salaries.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No salary records yet</p>
            <Button variant="outline" className="mt-4" onClick={() => { setEditItem(null); setDrawerOpen(true); }}>
              <Plus size={14} className="mr-2" /> Add your first salary
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Position</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Payment Date</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((item, i) => (
                  <tr key={item.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-blue-600">
                            {item.employee_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{item.employee_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.position}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-sm font-jetbrains">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{item.payment_date}</td>
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
                  <td className="px-5 py-3 text-right font-bold font-jetbrains">{formatCurrency(total)}</td>
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
        type="salary"
        defaultValues={editItem ? {
          employee_name: editItem.employee_name,
          position: editItem.position,
          amount: editItem.amount,
          payment_date: editItem.payment_date,
          notes: editItem.notes || "",
        } : undefined}
        editId={editItem?.id}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={() => deleteSalary(deleteId!)}
        title="Delete Salary Record"
        description="This will permanently delete this salary record."
      />
    </div>
  );
}
