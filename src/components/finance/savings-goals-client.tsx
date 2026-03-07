"use client";

import { useState } from "react";
import { PersonalSavingsGoal, formatCurrency } from "@/types/finance";
import { PersonalRecordDrawer } from "./personal-record-drawer";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from "@/app/dashboard/personal/actions";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { PageHeader } from "./page-header";
import { Progress } from "@/components/ui/progress";

interface Props {
  goals: PersonalSavingsGoal[];
}

export function SavingsGoalsClient({ goals }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState<PersonalSavingsGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  const handleEdit = (item: PersonalSavingsGoal) => {
    setEditItem(item);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) return updateSavingsGoal(id, formData);
    return addSavingsGoal(formData);
  };

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Savings Goals"
        subtitle={`${goals.length} goals · Saved ${formatCurrency(totalSaved)} of ${formatCurrency(totalTarget)}`}
        icon="Target"
        action={
          <Button
            onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus size={16} className="mr-2" /> Add Goal
          </Button>
        }
      />

      <div className="mt-6">
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl card-shadow py-16 text-center">
            <Target size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No savings goals yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setEditItem(null); setDrawerOpen(true); }}
            >
              <Plus size={14} className="mr-2" /> Create your first goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const progress = goal.target_amount > 0
                ? Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100)
                : 0;
              const isComplete = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className={`bg-white rounded-2xl p-5 card-shadow card-shadow-hover relative overflow-hidden ${isComplete ? "ring-2 ring-emerald-300" : ""}`}
                >
                  {isComplete && (
                    <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      COMPLETE ✓
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(goal)}>
                        <Pencil size={12} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(goal.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <Progress value={progress} className="h-2.5" />
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Saved</p>
                      <p className="text-base font-bold stat-number text-violet-700">
                        {formatCurrency(goal.current_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-sm font-semibold font-jetbrains text-muted-foreground">
                        {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {progress.toFixed(1)}% complete
                  </p>

                  {goal.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t truncate">{goal.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PersonalRecordDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditItem(null); }}
        type="savings_goal"
        defaultValues={editItem ? {
          name: editItem.name,
          target_amount: editItem.target_amount,
          current_amount: editItem.current_amount,
          deadline: editItem.deadline || "",
          notes: editItem.notes || "",
        } : undefined}
        editId={editItem?.id}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={() => deleteSavingsGoal(deleteId!)}
        title="Delete Savings Goal"
        description="This will permanently delete this savings goal."
      />
    </div>
  );
}
