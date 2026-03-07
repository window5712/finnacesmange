"use client";

import { useRef, useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERSONAL_INCOME_CATEGORIES, PERSONAL_EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types/finance";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type PersonalFormType = "personal_income" | "personal_expense" | "savings_goal";

interface PersonalRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  type: PersonalFormType;
  defaultValues?: Record<string, string | number | boolean>;
  editId?: string;
  onSubmit: (formData: FormData, id?: string) => Promise<{ error?: string; data?: unknown }>;
}

export function PersonalRecordDrawer({
  open,
  onClose,
  type,
  defaultValues,
  editId,
  onSubmit,
}: PersonalRecordDrawerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(
    (defaultValues?.category as string) || (type === "personal_income" ? "salary" : "other")
  );
  const [paymentMethod, setPaymentMethod] = useState(
    (defaultValues?.payment_method as string) || "cash"
  );
  const [isRecurring, setIsRecurring] = useState(
    (defaultValues?.is_recurring as boolean) || false
  );

  const titles: Record<PersonalFormType, { add: string; edit: string }> = {
    personal_income: { add: "Add Personal Income", edit: "Edit Personal Income" },
    personal_expense: { add: "Add Personal Expense", edit: "Edit Personal Expense" },
    savings_goal: { add: "Add Savings Goal", edit: "Edit Savings Goal" },
  };

  const title = editId ? titles[type].edit : titles[type].add;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    if (type === "personal_income") formData.set("category", category);
    if (type === "personal_expense") {
      formData.set("category", category);
      formData.set("payment_method", paymentMethod);
    }
    formData.set("is_recurring", isRecurring ? "true" : "false");

    startTransition(async () => {
      const result = await onSubmit(formData, editId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(editId ? "Record updated" : "Record added");
        onClose();
        formRef.current?.reset();
      }
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl" style={{ fontFamily: "Fraunces, serif" }}>
            {title}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {editId ? "Update the record details below." : "Fill in the details to add a new record."}
          </SheetDescription>
        </SheetHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {type === "personal_income" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="source">Income Source *</Label>
                <Input
                  id="source"
                  name="source"
                  required
                  defaultValue={defaultValues?.source as string}
                  placeholder="e.g., Monthly Salary, Freelance Project"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={defaultValues?.description as string}
                  placeholder="Brief description"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSONAL_INCOME_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace(/\b\w/g, (x) => x.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (PKR) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={defaultValues?.amount as number}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={(defaultValues?.date as string) || today}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                <Label className="text-sm">Recurring income</Label>
              </div>
            </>
          )}

          {type === "personal_expense" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  name="description"
                  required
                  defaultValue={defaultValues?.description as string}
                  placeholder="e.g., Grocery shopping, Electric bill"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSONAL_EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace(/\b\w/g, (x) => x.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (PKR) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={defaultValues?.amount as number}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={(defaultValues?.date as string) || today}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                <Label className="text-sm">Recurring expense</Label>
              </div>
            </>
          )}

          {type === "savings_goal" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">Goal Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={defaultValues?.name as string}
                  placeholder="e.g., Emergency Fund, Vacation"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="target_amount">Target Amount (PKR) *</Label>
                  <Input
                    id="target_amount"
                    name="target_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={defaultValues?.target_amount as number}
                    placeholder="10000.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="current_amount">Saved So Far (PKR)</Label>
                  <Input
                    id="current_amount"
                    name="current_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={defaultValues?.current_amount as number || 0}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Target Date (optional)</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  defaultValue={defaultValues?.deadline as string}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={defaultValues?.notes as string}
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Saving...</>
              ) : (
                editId ? "Update Record" : "Add Record"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
