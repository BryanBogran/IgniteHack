import { Shield, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MementoSystemStatus } from "@/lib/memento/types";
import { formatDateTime } from "@/lib/utils";

export function MementoSystemCard({ status }: { status: MementoSystemStatus }) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(13,25,33,0.96),rgba(10,18,25,0.92))] p-6" aria-labelledby="system-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="system-heading" className="text-sm font-semibold text-[var(--foreground)]">
            System health
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            The dashboard stays read-only. The Python worker owns camera access, detection, and SQLite writes.
          </p>
        </div>
        <Badge variant={status.cameraOnline ? "soft" : "outline"}>
          {status.cameraOnline ? "Camera online" : "Awaiting heartbeat"}
        </Badge>
      </div>

      <div className="mt-6 space-y-4 text-sm text-white/78">
        <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/4 p-4">
          <Video className="size-5 text-[var(--accent)]" />
          <div>
            <p className="font-medium text-[var(--foreground)]">Last worker heartbeat</p>
            <p className="mt-1 text-[var(--muted)]">
              {status.lastHeartbeatAt ? formatDateTime(status.lastHeartbeatAt) : "No heartbeat received yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/4 p-4">
          <Shield className="size-5 text-[var(--accent)]" />
          <div>
            <p className="font-medium text-[var(--foreground)]">Privacy mode</p>
            <p className="mt-1 text-[var(--muted)]">Frames processed locally and discarded immediately after metadata extraction.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">SQLite path</p>
        <p className="mt-2 break-all text-sm text-white/78">{status.databasePath}</p>
      </div>
    </Card>
  );
}
