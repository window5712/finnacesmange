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
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types/finance";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type FormType = "income" | "expense" | "salary" | "investment";

interface RecordDrawerProps {
  open: boolean;
  onClose: () => void;
  type: FormType;
  defaultValues?: Record<string, string | number>;
  editId?: string;
  onSubmit: (formData: FormData, id?: string) => Promise<{ error?: string; data?: unknown }>;
}

export function RecordDrawer({
  open,
  onClose,
  type,
  defaultValues,
  editId,
  onSubmit,
}: RecordDrawerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState(
    (defaultValues?.payment_method as string) || "bank_transfer"
  );
  const [category, setCategory] = useState(
    (defaultValues?.category as string) || "office"
  );

  const titles: Record<FormType, { add: string; edit: string }> = {
    income: { add: "Add Income Record", edit: "Edit Income Record" },
    expense: { add: "Add Expense", edit: "Edit Expense" },
    salary: { add: "Add Salary", edit: "Edit Salary" },
    investment: { add: "Add Investment", edit: "Edit Investment" },
  };

  const title = editId ? titles[type].edit : titles[type].add;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    if (type === "income") formData.set("payment_method", paymentMethod);
    if (type === "expense") formData.set("category", category);

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
          {type === "income" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  name="project_name"
                  required
                  defaultValue={defaultValues?.project_name as string}
                  placeholder="Website Redesign"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  name="client_name"
                  required
                  defaultValue={defaultValues?.client_name as string}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method *</Label>
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
                  <Label htmlFor="amount">Amount ($) *</Label>
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
            </>
          )}

          {type === "expense" && (
            <>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace(/\b\w/g, (x) => x.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  name="description"
                  required
                  defaultValue={defaultValues?.description as string}
                  placeholder="Monthly Figma subscription"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount ($) *</Label>
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
            </>
          )}

          {type === "salary" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="employee_name">Employee Name *</Label>
                <Input
                  id="employee_name"
                  name="employee_name"
                  required
                  defaultValue={defaultValues?.employee_name as string}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  name="position"
                  required
                  defaultValue={defaultValues?.position as string}
                  placeholder="Full Stack Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Salary ($) *</Label>
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
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    name="payment_date"
                    type="date"
                    required
                    defaultValue={(defaultValues?.payment_date as string) || today}
                  />
                </div>
              </div>
            </>
          )}

          {type === "investment" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="purpose">Purpose / Label *</Label>
                <Input
                  id="purpose"
                  name="purpose"
                  required
                  defaultValue={defaultValues?.purpose as string}
                  placeholder="Server Infrastructure Upgrade"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount ($) *</Label>
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
              className="flex-1 bg-[#1A5C5A] hover:bg-[#154D4B] text-white"
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
