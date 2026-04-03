import { Compass, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardLiveSections } from "@/components/dashboard/dashboard-live-sections";
import { LiveCameraPanel } from "@/components/dashboard/live-camera-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { answerMementoQuery } from "@/lib/memento/query";
import { getMementoDashboardData } from "@/lib/memento/store";

const quickLinks = [
  {
    title: "Find something fast",
    description: "Jump straight to the search box and ask where an item was last seen.",
    href: "#search",
    icon: Compass,
  },
  {
    title: "Check tracked items",
    description: "Scan the latest state of keys, wallet, glasses, and other essentials.",
    href: "#items",
    icon: Eye,
  },
  {
    title: "Confirm system status",
    description: "Review camera heartbeat, worker health, and privacy mode in one place.",
    href: "#system",
    icon: ShieldCheck,
  },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const mementoParams = await ((searchParams ?? Promise.resolve({})) as Promise<{ q?: string | string[] }>);
  const queryText = typeof mementoParams.q === "string" ? mementoParams.q : "";
  const [mementoData, queryResult] = await Promise.all([
    Promise.resolve(getMementoDashboardData()),
    Promise.resolve(queryText ? answerMementoQuery(queryText) : null),
  ]);

  return (
    <div className="space-y-8">
      <LiveCameraPanel />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-[rgba(77,193,175,0.22)] bg-[linear-gradient(135deg,rgba(12,31,39,0.96),rgba(8,20,28,0.92))] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Start here</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                The dashboard is organized around three simple tasks.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78">
                Search first, review tracked items second, and use system health only when something looks off.
              </p>
            </div>
            <Badge variant="soft">Simplified flow</Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.title}
                  href={link.href}
                  className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5 transition hover:border-[var(--accent)] hover:bg-white/7"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-white">{link.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{link.description}</p>
                </a>
              );
            })}
          </div>
        </Card>

        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(13,25,33,0.96),rgba(10,18,25,0.92))] p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">What this page answers</p>
              <p className="mt-2 text-sm leading-7 text-white/72">
                Use the dashboard to answer “Where did I leave it?”, “Is it still visible?”, and “Is the system still
                recording object events?” without navigating through extra setup screens.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4 text-sm text-white/78">Search returns the latest known location and timestamp.</div>
            <div className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4 text-sm text-white/78">Tracked items show current visibility and confidence at a glance.</div>
            <div className="rounded-[1.25rem] border border-white/8 bg-white/4 p-4 text-sm text-white/78">System health stays on the side so it is available without getting in the way.</div>
          </div>
        </Card>
      </section>

      <DashboardLiveSections
        initialData={mementoData}
        initialQuery={queryText}
        initialQueryResult={queryResult}
      />
    </div>
  );
}
