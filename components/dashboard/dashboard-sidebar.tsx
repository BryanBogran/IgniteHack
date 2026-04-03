import Link from "next/link";
import { BarChart3, ClipboardList, LayoutDashboard, NotebookText } from "lucide-react";
import { Card } from "@/components/ui/card";

const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Project", href: "/dashboard#project", icon: ClipboardList },
  { label: "Notes", href: "/dashboard#notes", icon: NotebookText },
  { label: "Activity", href: "/dashboard#activity", icon: BarChart3 },
];

export function DashboardSidebar() {
  return (
    <Card className="h-fit p-4 lg:sticky lg:top-24">
      <div className="mb-4 px-3 pt-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">Demo control room</p>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
