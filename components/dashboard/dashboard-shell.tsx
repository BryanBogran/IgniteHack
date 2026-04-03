import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Container } from "@/components/ui/container";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[radial-gradient(circle_at_top,rgba(65,199,176,0.08),transparent_30%),linear-gradient(180deg,rgba(6,12,16,0.2)_0%,rgba(6,12,16,0)_100%)] py-8 sm:py-10">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <DashboardSidebar />
          <div>{children}</div>
        </div>
      </Container>
    </main>
  );
}
