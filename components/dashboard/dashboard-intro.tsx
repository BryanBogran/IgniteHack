import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProfileRow, ProjectRow } from "@/types/database";

export function DashboardIntro({
  profile,
  project,
}: {
  profile: ProfileRow | null;
  project: ProjectRow | null;
}) {
  return (
    <Card className="overflow-hidden border-white/50 bg-[linear-gradient(135deg,rgba(15,118,110,0.1),rgba(255,255,255,0.9))] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Badge>Dashboard</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 [font-family:var(--font-display)] sm:text-4xl">
              {project?.title ?? "Build your first project narrative"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {project?.summary ??
                "Create a project, capture notes, and turn loose ideas into a clean judge-facing story."}
            </p>
          </div>
        </div>
        <div className="grid gap-3 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Team</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.team_name ?? "Set your team name"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Stage</p>
            <p className="mt-2 text-sm font-medium text-slate-700">{project?.stage ?? "Discovery"}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
