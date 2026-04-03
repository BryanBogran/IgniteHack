import Link from "next/link";
import { Activity, Search, Shield, TableProperties } from "lucide-react";
import { Card } from "@/components/ui/card";

const links = [
  { label: "Search", href: "/dashboard#search", icon: Search, description: "Ask where something was left." },
  { label: "Items", href: "/dashboard#items", icon: TableProperties, description: "View all tracked essentials." },
  { label: "Activity", href: "/dashboard#activity", icon: Activity, description: "Review the latest memory events." },
  { label: "System", href: "/dashboard#system", icon: Shield, description: "Check worker and camera status." },
];

export function DashboardSidebar() {
  return (
    <Card className="h-fit p-4 lg:sticky lg:top-24">
      <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Navigation</p>
        <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">Project Anchor dashboard</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Everything important is grouped into four sections.</p>
      </div>

      <nav className="mt-4 space-y-2" aria-label="Dashboard sections">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              className="block rounded-[1.25rem] border border-transparent px-3 py-3 transition hover:border-white/10 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{link.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{link.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
