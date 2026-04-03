import type { NoteRow, ProfileRow, ProjectRow } from "@/types/database";
import type { createServerClient } from "@/lib/supabase/server";

type DashboardSupabaseClient = Awaited<ReturnType<typeof createServerClient>>;

export async function getDashboardData(supabase: DashboardSupabaseClient, userId: string) {
  const [{ data: profile }, { data: project }, { data: notes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("notes")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    profile: (profile as ProfileRow | null) ?? null,
    project: (project as ProjectRow | null) ?? null,
    notes: (notes as NoteRow[] | null) ?? [],
  };
}
