import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// This route uses the service role key to create/reset admin users
// It BYPASSES the broken auth schema completely
// Access it at: http://localhost:3000/api/setup-admins

const SETUP_SECRET = "setup-finnaceos-2026"; // simple protection

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (secret !== SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || serviceRoleKey === "YOUR_SERVICE_ROLE_KEY_HERE") {
    return NextResponse.json({
      error: "SUPABASE_SERVICE_ROLE_KEY not set in .env",
      instructions: "Get it from: https://supabase.com/dashboard/project/jryjutcrvzpotfegixoq/settings/api",
    }, { status: 500 });
  }

  // Create admin Supabase client with service role key
  const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const adminUsers = [
    { email: "aryan@prolx.cloud", password: "Admin123###", name: "aryan" },
    { email: "yassen@prolx.cloud", password: "Admin123###", name: "yassen" },
  ];

  const results: any[] = [];

  for (const adminUser of adminUsers) {
    // Try to delete first (clean slate)
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const found = existingUser?.users?.find(u => u.email === adminUser.email);
    
    if (found) {
      await supabaseAdmin.auth.admin.deleteUser(found.id);
    }

    // Create fresh
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminUser.name,
        name: adminUser.name,
        email: adminUser.email,
      }
    });

    if (error) {
      results.push({ email: adminUser.email, status: "error", error: error.message });
    } else {
      // Update role in public.users
      await supabaseAdmin.from("users").upsert({
        id: data.user!.id,
        email: adminUser.email,
        name: adminUser.name,
        full_name: adminUser.name,
        user_id: data.user!.id,
        token_identifier: data.user!.id,
        role: "admin",
        created_at: new Date().toISOString()
      }, { onConflict: "id" });

      results.push({ email: adminUser.email, status: "created", id: data.user!.id });
    }
  }

  return NextResponse.json({
    message: "Admin setup complete",
    results,
    loginWith: {
      email: "aryan@prolx.cloud OR yassen@prolx.cloud",
      password: "Admin123###"
    }
  });
}
