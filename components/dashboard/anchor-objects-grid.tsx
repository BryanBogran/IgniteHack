import { Eye, MapPin, ScanSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AnchorObjectState } from "@/lib/anchor/types";
import { formatDateTime } from "@/lib/utils";

function prettyZone(zoneName: string | null) {
  return zoneName ? zoneName.replace(/_/g, " ") : "Unassigned zone";
}

export function AnchorObjectsGrid({ objects }: { objects: AnchorObjectState[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Tracked essentials</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Latest known state for every object the memory worker has seen.
          </p>
        </div>
        <Badge variant="soft">{objects.length} tracked</Badge>
      </div>

      {objects.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {objects.map((object) => (
            <div key={object.objectLabel} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold capitalize text-slate-950">{object.objectLabel}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {object.isVisible ? "Visible now" : "Using last known state"}
                  </p>
                </div>
                <Badge variant={object.isVisible ? "soft" : "outline"}>
                  {object.isVisible ? "Visible" : "Last seen"}
                </Badge>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-[var(--accent)]" />
                  <span className="capitalize">{prettyZone(object.zoneName)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ScanSearch className="size-4 text-[var(--accent)]" />
                  <span>{object.lastSeenAt ? formatDateTime(object.lastSeenAt) : "No sightings recorded"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-[var(--accent)]" />
                  <span>
                    {object.lastConfidence !== null
                      ? `${Math.round(object.lastConfidence * 100)}% confidence`
                      : "Awaiting confidence data"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
          No objects have been stored yet. Start the Python worker and place a tracked item inside one of your configured
          drop zones to populate this grid.
        </div>
      )}
    </Card>
  );
}
