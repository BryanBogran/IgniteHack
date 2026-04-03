import { Container } from "@/components/ui/container";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <main className="py-8 sm:py-12"><Container>{children}</Container></main>;
}
