"use client";

import { useState } from "react";
import { Investment, formatCurrency } from "@/types/finance";
import { RecordDrawer } from "./record-drawer";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { addInvestment, updateInvestment, deleteInvestment } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, PiggyBank } from "lucide-react";
import { PageHeader } from "./page-header";

interface Props {
  investments: Investment[];
}

export function InvestmentsClient({ investments }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<Investment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const total = investments.reduce((s, i) => s + Number(i.amount), 0);

  const handleEdit = (item: Investment) => {
    setEditItem(item);
    setDrawerOpen(true);
  };

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) return updateInvestment(id, formData);
    return addInvestment(formData);
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Investments"
        subtitle={`${investments.length} records · Total: ${formatCurrency(total)}`}
        icon={PiggyBank}
        action={
          <Button
            onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            className="bg-[#1A5C5A] hover:bg-[#154D4B] text-white"
          >
            <Plus size={16} className="mr-2" /> Add Investment
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {investments.length === 0 ? (
          <div className="col-span-3 bg-white rounded-2xl card-shadow py-16 text-center">
            <PiggyBank size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No investment records yet</p>
            <Button variant="outline" className="mt-4" onClick={() => { setEditItem(null); setDrawerOpen(true); }}>
              <Plus size={14} className="mr-2" /> Add your first investment
            </Button>
          </div>
        ) : (
          investments.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 card-shadow card-shadow-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <PiggyBank size={17} className="text-emerald-600" />
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)}>
                    <Pencil size={12} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { setDeleteId(item.id); setDeleteOpen(true); }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.purpose}</h3>
              {item.notes && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.notes}</p>}
              <div className="flex items-end justify-between mt-4">
                <p className="text-xs text-muted-foreground">{item.date}</p>
                <p className="text-xl font-bold text-emerald-600 stat-number">{formatCurrency(item.amount)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {investments.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-5 card-shadow flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Total Investment Reserve</p>
          <p className="text-2xl font-bold text-emerald-600 stat-number">{formatCurrency(total)}</p>
        </div>
      )}

      <RecordDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        type="investment"
        defaultValues={editItem ? {
          purpose: editItem.purpose,
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
        onConfirm={() => deleteInvestment(deleteId!)}
        title="Delete Investment"
        description="This will permanently delete this investment record."
      />
    </div>
  );
}
