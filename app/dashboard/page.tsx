import { redirect } from "next/navigation";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardIntro } from "@/components/dashboard/dashboard-intro";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { NotesPanel } from "@/components/dashboard/notes-panel";
import { ProjectOverviewCard } from "@/components/dashboard/project-overview-card";
import { ProjectSections } from "@/components/dashboard/project-sections";
import { ProjectSettingsCard } from "@/components/dashboard/project-settings-card";
import { SetupNotice } from "@/components/layout/setup-notice";
import { createServerClientSafe } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return <SetupNotice />;
  }

  const supabase = await createServerClientSafe();

  if (!supabase) {
    return <SetupNotice />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const data = await getDashboardData(supabase, user.id);

  return (
    <div className="space-y-8">
      <DashboardIntro profile={data.profile} project={data.project} />
      <DashboardStats notesCount={data.notes.length} hasProject={Boolean(data.project)} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <ProjectOverviewCard project={data.project} />
          <ProjectSections />
          <NotesPanel notes={data.notes} projectId={data.project?.id ?? null} />
          <ActivityFeed notes={data.notes} />
        </div>
        <div className="space-y-6">
          <ProjectSettingsCard profile={data.profile} project={data.project} />
        </div>
      </div>
    </div>
  );
}
