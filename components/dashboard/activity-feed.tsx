import { Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { formatDateTime } from "@/lib/utils";
import type { NoteRow } from "@/types/database";

export function ActivityFeed({ notes }: { notes: NoteRow[] }) {
  const items = notes.slice(0, 4);

  return (
    <Card className="p-6">
      <SectionHeader
        eyebrow="Activity"
        title="Recent momentum"
        description="A lightweight activity feed that helps during rehearsals and check-ins."
      />
      {items.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Once notes are added, this feed becomes a quick demo-friendly narrative of progress."
        />
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((note) => (
            <div key={note.id} className="flex gap-3 rounded-2xl border border-slate-200/80 p-4">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Clock3 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Team note updated</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{note.content}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDateTime(note.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
