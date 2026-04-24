"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Wallet, Search, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PartnerTransaction, formatCurrency } from "@/types/finance";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { deletePartnerTransaction, addPartnerTransaction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

export function PartnerTransactionsClient({
  initialData,
  partners,
}: {
  initialData: PartnerTransaction[];
  partners: { id: string; email: string }[];
}) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PartnerTransaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const getPartnerEmail = (id: string) => partners.find(p => p.id === id)?.email || id;

  const filteredData = data.filter((item) =>
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async () => {
    if (!recordToDelete) return { error: "No record selected" };
    const result = await deletePartnerTransaction(recordToDelete);
    if (result.success) {
      setData((prev) => prev.filter((item) => item.id !== recordToDelete));
    } else {
      console.error(result.error);
    }
    setIsDeleteDialogOpen(false);
    return { success: result.success === true, error: result.error };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notes or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 flex sm:hidden">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => { setSelectedRecord(null); setIsDrawerOpen(true); }} className="w-full sm:w-auto gap-2 text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus size={16} /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {formatCurrency(data.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {formatCurrency(data.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Number(t.amount), 0))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatCurrency(data.filter(t => t.type === 'investment').reduce((sum, t) => sum + Number(t.amount), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Partner</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Notes</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(item.transaction_date), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4">{getPartnerEmail(item.partner_id)}</td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'deposit' ? 'bg-indigo-100 text-indigo-700' :
                        item.type === 'withdrawal' ? 'bg-rose-100 text-rose-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-jetbrains font-medium">{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4 text-zinc-500 hidden md:table-cell max-w-[200px] truncate">
                      {item.notes || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setRecordToDelete(item.id); setIsDeleteDialogOpen(true); }}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Partner Transaction</h2>
              <form action={async (formData) => {
                const res = await addPartnerTransaction(formData);
                if (!res.error) {
                  window.location.reload();
                } else {
                  console.error(res.error);
                }
              }} className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Type</label>
                  <select name="type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="deposit">Deposit to Company</option>
                    <option value="withdrawal">Withdrawal from Company</option>
                    <option value="investment">Investment / Reserve</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Amount (PKR)</label>
                  <Input name="amount" type="number" required placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input name="notes" placeholder="Optional details..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 text-white bg-indigo-600 hover:bg-indigo-700">
                    Add Record
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this partner transaction? This action cannot be undone."
      />
    </div>
  );
}
