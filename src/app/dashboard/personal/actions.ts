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

// Personal Income Actions
export async function addPersonalIncome(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    source: formData.get("source") as string,
    description: formData.get("description") as string || null,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    is_recurring: formData.get("is_recurring") === "true",
    notes: formData.get("notes") as string || null,
    user_id: user.id,
  };

  const { data, error } = await supabase.from("personal_income").insert(payload).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Created personal income", "personal_income", data.id, { amount: payload.amount, source: payload.source });
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/income");
  return { data };
}

export async function updatePersonalIncome(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    source: formData.get("source") as string,
    description: formData.get("description") as string || null,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    is_recurring: formData.get("is_recurring") === "true",
    notes: formData.get("notes") as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("personal_income").update(payload).eq("id", id).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Updated personal income", "personal_income", id, { amount: payload.amount });
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/income");
  return { data };
}

export async function deletePersonalIncome(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_income").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity(supabase, "Deleted personal income", "personal_income", id);
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/income");
  return { success: true };
}

// Personal Expense Actions
export async function addPersonalExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    payment_method: formData.get("payment_method") as string,
    is_recurring: formData.get("is_recurring") === "true",
    notes: formData.get("notes") as string || null,
    user_id: user.id,
  };

  const { data, error } = await supabase.from("personal_expenses").insert(payload).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Created personal expense", "personal_expenses", data.id, { amount: payload.amount, category: payload.category });
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/expenses");
  return { data };
}

export async function updatePersonalExpense(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    payment_method: formData.get("payment_method") as string,
    is_recurring: formData.get("is_recurring") === "true",
    notes: formData.get("notes") as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("personal_expenses").update(payload).eq("id", id).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Updated personal expense", "personal_expenses", id, { amount: payload.amount });
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/expenses");
  return { data };
}

export async function deletePersonalExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity(supabase, "Deleted personal expense", "personal_expenses", id);
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/expenses");
  return { success: true };
}

// Savings Goals Actions
export async function addSavingsGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    name: formData.get("name") as string,
    target_amount: parseFloat(formData.get("target_amount") as string),
    current_amount: parseFloat(formData.get("current_amount") as string) || 0,
    deadline: formData.get("deadline") as string || null,
    notes: formData.get("notes") as string || null,
    user_id: user.id,
  };

  const { data, error } = await supabase.from("personal_savings_goals").insert(payload).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Created savings goal", "personal_savings_goals", data.id, { name: payload.name, target: payload.target_amount });
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/savings");
  return { data };
}

export async function updateSavingsGoal(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    name: formData.get("name") as string,
    target_amount: parseFloat(formData.get("target_amount") as string),
    current_amount: parseFloat(formData.get("current_amount") as string) || 0,
    deadline: formData.get("deadline") as string || null,
    notes: formData.get("notes") as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("personal_savings_goals").update(payload).eq("id", id).select().single();
  if (error) return { error: error.message };

  await logActivity(supabase, "Updated savings goal", "personal_savings_goals", id, { name: payload.name });
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/savings");
  return { data };
}

export async function deleteSavingsGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_savings_goals").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActivity(supabase, "Deleted savings goal", "personal_savings_goals", id);
  revalidatePath("/dashboard/personal");
  revalidatePath("/dashboard/personal/savings");
  return { success: true };
}

// Security Actions
export async function changeUserPassword(password: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  
  await logActivity(supabase, "Updated password", "security", user.id);
  return { success: true };
}
