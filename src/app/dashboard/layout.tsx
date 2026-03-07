import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { logger } from "@/utils/logger";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.info("DashboardLayout: Initializing Supabase client");
  const supabase = await createClient();

  logger.info("DashboardLayout: Fetching user from auth");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    logger.error("DashboardLayout: Auth error fetching user", { message: authError.message });
  }

  if (!user) {
    logger.warn("DashboardLayout: No user found, redirecting to sign-in");
    return redirect("/sign-in");
  }

  logger.info("DashboardLayout: User authenticated, fetching profile", { userId: user.id });
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    // PGRST116 = no rows found (user exists in auth but not in public.users yet)
    const isNotFound = profileError.code === "PGRST116";
    if (isNotFound) {
      logger.warn("DashboardLayout: No profile row found for user, defaulting to 'user' role", {
        userId: user.id,
        hint: "Run 20250308_fix_users_rls.sql migration and ensure user row exists in public.users",
      });
    } else {
      logger.error("DashboardLayout: Error fetching user profile", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });
    }
  }

  logger.info("DashboardLayout: Profile fetched", { role: profile?.role || "user" });

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <AppSidebar
        userRole={profile?.role || "user"}
        userName={(profile as any)?.full_name || user.email?.split("@")[0] || "User"}
        userEmail={user.email || ""}
      />
      <main className="md:ml-64 transition-all duration-300 min-h-screen">
        <div className="pb-20 md:pb-0">{children}</div>
      </main>
    </div>
  );
}
