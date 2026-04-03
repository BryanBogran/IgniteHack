import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Container } from "@/components/ui/container";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <DashboardSidebar />
          <div>{children}</div>
        </div>
      </Container>
    </main>
  );
}
