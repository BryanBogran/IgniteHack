import { addNoteAction } from "@/lib/actions/dashboard";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import type { NoteRow } from "@/types/database";

export function NotesPanel({ notes, projectId }: { notes: NoteRow[]; projectId: string | null }) {
  const action = addNoteAction.bind(null, projectId);

  return (
    <Card id="notes" className="p-6">
      <SectionHeader
        eyebrow="Team Notes"
        title="Capture insights while the team iterates"
        description="Use notes for quotes, sizing assumptions, risks, and talking points before the final pitch."
      />
      <form action={action} className="mt-6 space-y-4">
        <Textarea
          name="content"
          placeholder={projectId ? "Add a concise note your team can use in the next stand-up..." : "Create a project first to start saving notes."}
          disabled={!projectId}
          rows={4}
          required
        />
        <SubmitButton disabled={!projectId}>Add note</SubmitButton>
      </form>
      {notes.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No notes yet"
            description="Use this section to capture customer quotes, assumptions, and talking points as the story comes together."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-2xl border border-slate-200/80 p-4">
              <p className="text-sm leading-7 text-slate-700">{note.content}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDateTime(note.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
