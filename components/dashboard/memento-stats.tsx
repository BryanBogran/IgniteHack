import { Camera, Clock3, Eye } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Card } from "@/components/ui/card";
import type { MementoSystemStatus } from "@/lib/memento/types";
import { formatDateTime } from "@/lib/utils";

const statItems = (status: MementoSystemStatus) => [
  {
    label: "Camera status",
    value: status.cameraOnline ? "Online" : "Waiting",
    icon: Camera,
  },
  {
    label: "Objects tracked",
    value: `${status.trackedObjects}`,
    icon: Eye,
  },
  {
    label: "Last update",
    value: status.lastUpdateAt ? formatDateTime(status.lastUpdateAt) : "No events yet",
    icon: Clock3,
  },
];

export function MementoStats({ status }: { status: MementoSystemStatus }) {
  return (
    <AnimatedGroup className="grid gap-4 md:grid-cols-3" role="list" aria-label="System summary">
      {statItems(status).map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="border-white/10 bg-[linear-gradient(180deg,rgba(14,24,33,0.96),rgba(10,18,25,0.92))] p-5" role="listitem">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon className="size-5" aria-hidden="true" />
              </div>
            </div>
          </Card>
        );
      })}
    </AnimatedGroup>
  );
}
