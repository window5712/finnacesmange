"use server";

import { createClient } from "@supabase/server";
import { revalidatePath } from "next/cache";

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activity_log").insert({
    user_id: user.id,
    user_email: user.email,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

// Income Actions
export async function addIncome(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    project_name: formData.get("project_name") as string,
    client_name: formData.get("client_name") as string,
    payment_method: formData.get("payment_method") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: formData.get("notes") as string || null,
    created_by: user.id,
  };

  const { data, error } = await supabase.from("income").insert(payload).select().single();
  if (error) return { error: error.message };
  
  await logActivity(supabase, "Created income record", "income", data.id, { amount: payload.amount, project: payload.project_name });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  return { data };
}

export async function updateIncome(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    project_name: formData.get("project_name") as string,
    client_name: formData.get("client_name") as string,
    payment_method: formData.get("payment_method") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: formData.get("notes") as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("income").update(payload).eq("id", id).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Updated income record", "income", id, { amount: payload.amount });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  return { data };
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("income").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity(supabase, "Deleted income record", "income", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  return { success: true };
}

// Expense Actions
export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: formData.get("notes") as string || null,
    created_by: user.id,
  };

  const { data, error } = await supabase.from("expenses").insert(payload).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Created expense record", "expenses", data.id, { amount: payload.amount, category: payload.category });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  return { data };
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: formData.get("notes") as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("expenses").update(payload).eq("id", id).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Updated expense record", "expenses", id, { amount: payload.amount });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  return { data };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity(supabase, "Deleted expense record", "expenses", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  return { success: true };
}

// Salary Actions
export async function addSalary(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    employee_name: formData.get("employee_name") as string,
    position: formData.get("position") as string,
    amount: parseFloat(formData.get("amount") as string),
    payment_date: formData.get("payment_date") as string,
    notes: formData.get("notes") as string || null,
    created_by: user.id,
  };

  const { data, error } = await supabase.from("salaries").insert(payload).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Created salary record", "salaries", data.id, { amount: payload.amount, employee: payload.employee_name });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/salaries");
  return { data };
}

export async function updateSalary(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    employee_name: formData.get("employee_name") as string,
    position: formData.get("position") as string,
    amount: parseFloat(formData.get("amount") as string),
    payment_date: formData.get("payment_date") as string,
    notes: formData.get("notes") as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("salaries").update(payload).eq("id", id).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Updated salary record", "salaries", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/salaries");
  return { data };
}

export async function deleteSalary(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("salaries").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity(supabase, "Deleted salary record", "salaries", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/salaries");
  return { success: true };
}

// Investment Actions
export async function addInvestment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    purpose: formData.get("purpose") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: formData.get("notes") as string || null,
    created_by: user.id,
  };

  const { data, error } = await supabase.from("investments").insert(payload).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Created investment record", "investments", data.id, { amount: payload.amount, purpose: payload.purpose });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  return { data };
}

export async function updateInvestment(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    purpose: formData.get("purpose") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: formData.get("notes") as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("investments").update(payload).eq("id", id).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Updated investment record", "investments", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  return { data };
}

export async function deleteInvestment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("investments").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity(supabase, "Deleted investment record", "investments", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  return { success: true };
}

// Partner Transaction Actions
export async function addPartnerTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    partner_id: user.id,
    type: formData.get("type") as string, // 'deposit' | 'withdrawal' | 'investment'
    amount: parseFloat(formData.get("amount") as string),
    transaction_date: formData.get("date") as string,
    notes: formData.get("notes") as string || null,
  };

  const { data, error } = await supabase.from("partner_transactions").insert(payload).select().single();
  if (error) return { error: error.message };

  // Refresh wallet view
  await supabase.rpc("refresh_company_wallet");

  await logActivity(supabase, "Created partner transaction", "partner_transaction", data.id, {
    type: payload.type,
    amount: payload.amount,
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/partner");
  return { data };
}

export async function deletePartnerTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("partner_transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  // Refresh wallet view
  await supabase.rpc("refresh_company_wallet");

  await logActivity(supabase, "Deleted partner transaction", "partner_transaction", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/partner");
  return { success: true };
}

// One‑click Send Amount (partner withdrawal to company)
export async function sendAmount(formData: FormData) {
  // This creates a withdrawal type partner transaction
  return await addPartnerTransaction(formData);
}
