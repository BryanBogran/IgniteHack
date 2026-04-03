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
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(13,25,33,0.96),rgba(10,18,25,0.92))] p-6" aria-labelledby="items-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="items-heading" className="text-sm font-semibold text-[var(--foreground)]">
            Tracked essentials
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Latest known state for every object the memory worker has seen.
          </p>
        </div>
        <Badge variant="soft">{objects.length} tracked</Badge>
      </div>

      {objects.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {objects.map((object) => (
            <div key={object.objectLabel} className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold capitalize text-[var(--foreground)]">{object.objectLabel}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {object.isVisible ? "Visible now" : "Using last known state"}
                  </p>
                </div>
                <Badge variant={object.isVisible ? "soft" : "outline"}>
                  {object.isVisible ? "Visible" : "Last seen"}
                </Badge>
              </div>

              <div className="mt-5 space-y-3 text-sm text-white/78">
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
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/4 p-6 text-sm leading-7 text-[var(--muted)]">
          No objects have been stored yet. Start the Python worker and place a tracked item inside one of your configured
          drop zones to populate this grid.
        </div>
      )}
    </Card>
  );
}
