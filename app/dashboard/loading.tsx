import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <LoadingSkeleton className="h-[156px]" />
          <LoadingSkeleton className="h-[320px]" />
        </div>
        <div className="space-y-6">
          <LoadingSkeleton className="h-[220px]" />
          <LoadingSkeleton className="h-[260px]" />
        </div>
      </div>
    </DashboardShell>
  );
}
