import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <AppSidebar />
      <main className="md:ml-64 transition-all duration-300 min-h-screen">
        <div className="pb-20 md:pb-0">{children}</div>
      </main>
    </div>
  );
}
