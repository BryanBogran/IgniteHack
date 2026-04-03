import { AppShell } from "@/components/layout/app-shell";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <LoadingSkeleton className="h-[340px]" />
        <LoadingSkeleton className="h-[340px]" />
      </div>
    </AppShell>
  );
}
