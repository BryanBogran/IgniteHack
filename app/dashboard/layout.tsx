import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createServerClientSafe } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  const supabase = await createServerClientSafe();

  if (!supabase) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
