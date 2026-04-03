import { Camera, Clock3, Eye } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Card } from "@/components/ui/card";
import type { AnchorSystemStatus } from "@/lib/anchor/types";
import { formatDateTime } from "@/lib/utils";

const statItems = (status: AnchorSystemStatus) => [
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

export function AnchorStats({ status }: { status: AnchorSystemStatus }) {
  return (
    <AnimatedGroup className="grid gap-4 md:grid-cols-3">
      {statItems(status).map((item) => {
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
