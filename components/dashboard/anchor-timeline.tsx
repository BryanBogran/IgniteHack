import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AnchorSighting } from "@/lib/anchor/types";
import { formatDateTime } from "@/lib/utils";

export function AnchorTimeline({ sightings }: { sightings: AnchorSighting[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Recent memory timeline</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            The event history that powers Anchor’s last-known-location answers.
          </p>
        </div>
        <Badge variant="outline">{sightings.length} events</Badge>
      </div>

      {sightings.length ? (
        <div className="mt-6 space-y-3">
          {sightings.map((sighting) => (
            <div
              key={sighting.id}
              className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold capitalize text-slate-900">
                  {sighting.objectLabel} {sighting.state === "last_seen" ? "left view" : "seen"} in{" "}
                  <span className="capitalize">{(sighting.zoneName ?? "an unknown zone").replace(/_/g, " ")}</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">{formatDateTime(sighting.seenAt)}</p>
              </div>
              <Badge variant={sighting.state === "visible" ? "soft" : "outline"}>
                {sighting.state === "visible" ? "Visible event" : "Disappearance event"}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
          No timeline events yet. As soon as the worker sees an item or loses sight of one, the event stream appears here.
        </div>
      )}
    </Card>
  );
}
