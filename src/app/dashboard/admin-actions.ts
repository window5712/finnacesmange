"use server";

import { createClient } from "@supabase/server";
import { revalidatePath } from "next/cache";

export async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

export async function getUsers() {
  if (!(await isAdmin())) return { error: "Not authorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function updateUserRole(userId: string, role: string) {
  if (!(await isAdmin())) return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/users");
  return { success: true };
}

// Note: Direct password change for other users requires SUPABASE_SERVICE_ROLE_KEY
// For now, we provide a way to trigger a reset email.
export async function requestUserPasswordReset(email: string) {
  if (!(await isAdmin())) return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) return { error: error.message };
  return { success: true };
}
