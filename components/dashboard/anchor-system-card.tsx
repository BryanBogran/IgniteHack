import { Shield, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AnchorSystemStatus } from "@/lib/anchor/types";
import { formatDateTime } from "@/lib/utils";

export function AnchorSystemCard({ status }: { status: AnchorSystemStatus }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">System health</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            The dashboard stays read-only. The Python worker owns camera access, detection, and SQLite writes.
          </p>
        </div>
        <Badge variant={status.cameraOnline ? "soft" : "outline"}>
          {status.cameraOnline ? "Camera online" : "Awaiting heartbeat"}
        </Badge>
      </div>

      <div className="mt-6 space-y-4 text-sm text-slate-700">
        <div className="flex items-center gap-3 rounded-[1.25rem] bg-slate-50 p-4">
          <Video className="size-5 text-[var(--accent)]" />
          <div>
            <p className="font-medium text-slate-900">Last worker heartbeat</p>
            <p className="mt-1 text-slate-500">
              {status.lastHeartbeatAt ? formatDateTime(status.lastHeartbeatAt) : "No heartbeat received yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[1.25rem] bg-slate-50 p-4">
          <Shield className="size-5 text-[var(--accent)]" />
          <div>
            <p className="font-medium text-slate-900">Privacy mode</p>
            <p className="mt-1 text-slate-500">Frames processed locally and discarded immediately after metadata extraction.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[1.25rem] border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">SQLite path</p>
        <p className="mt-2 break-all text-sm text-slate-700">{status.databasePath}</p>
      </div>
    </Card>
  );
}
