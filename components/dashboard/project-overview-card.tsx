import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import type { ProjectRow } from "@/types/database";

export function ProjectOverviewCard({ project }: { project: ProjectRow | null }) {
  if (!project) {
    return (
      <Card id="project" className="p-6">
        <EmptyState
          title="No project yet"
          description="Create a project profile on the right to unlock notes, activity, and a stronger live-demo story."
        />
      </Card>
    );
  }

  return (
    <Card id="project" className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">My Project</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{project.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{project.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="soft">{project.industry || "General"}</Badge>
          <Badge variant="outline">{project.stage || "Discovery"}</Badge>
        </div>
      </div>
    </Card>
  );
}
