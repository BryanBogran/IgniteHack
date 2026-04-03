import { FilePenLine, FolderKanban, Gauge } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Card } from "@/components/ui/card";

const statItems = (notesCount: number, hasProject: boolean) => [
  {
    label: "Project status",
    value: hasProject ? "Active" : "Not started",
    icon: FolderKanban,
  },
  {
    label: "Notes captured",
    value: `${notesCount}`,
    icon: FilePenLine,
  },
  {
    label: "Demo readiness",
    value: hasProject ? "Pitchable" : "Set up",
    icon: Gauge,
  },
];

export function DashboardStats({ notesCount, hasProject }: { notesCount: number; hasProject: boolean }) {
  return (
    <AnimatedGroup className="grid gap-4 md:grid-cols-3">
      {statItems(notesCount, hasProject).map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon className="size-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </AnimatedGroup>
  );
}
