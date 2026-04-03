import { saveProjectAction, updateProfileAction } from "@/lib/actions/dashboard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileRow, ProjectRow } from "@/types/database";

export function ProjectSettingsCard({
  profile,
  project,
}: {
  profile: ProfileRow | null;
  project: ProjectRow | null;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionHeader
          eyebrow="Team Profile"
          title="Keep the workspace identity current"
          description="These fields personalize the dashboard and make the starter feel ready for a live review."
        />
        <form action={updateProfileAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} placeholder="Jordan Lee" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_name">Team name</Label>
            <Input id="team_name" name="team_name" defaultValue={profile?.team_name ?? ""} placeholder="Apex Strategy" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              name="avatar_url"
              defaultValue={profile?.avatar_url ?? ""}
              placeholder="https://images.example.com/avatar.png"
            />
          </div>
          <SubmitButton>Save profile</SubmitButton>
        </form>
      </Card>

      <Card className="p-6">
        <SectionHeader
          eyebrow="Project Settings"
          title={project ? "Edit project" : "Create project"}
          description="Keep the domain model minimal: one core project, clear summary, and a stage that communicates maturity."
        />
        <form action={saveProjectAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={project?.title ?? ""} placeholder="Northstar Health" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" defaultValue={project?.industry ?? ""} placeholder="Healthcare" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Input id="stage" name="stage" defaultValue={project?.stage ?? ""} placeholder="Validation" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={6}
              defaultValue={project?.summary ?? ""}
              placeholder="Describe the venture, problem space, and why your solution matters."
              required
            />
          </div>
          <SubmitButton>{project ? "Update project" : "Create project"}</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
