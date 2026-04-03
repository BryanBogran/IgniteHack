import Link from "next/link";
import { ArrowRight, BarChart3, Lightbulb, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";

const features = [
  {
    title: "Investor-ready polish",
    description: "Clean landing page, refined dashboard, and transitions that feel intentional in a live demo.",
    icon: Sparkles,
  },
  {
    title: "Fast team collaboration",
    description: "Simple project and note primitives let teams organize research, messaging, and pitch material quickly.",
    icon: NotebookPen,
  },
  {
    title: "Supabase-native backend",
    description: "SSR-compatible auth, Postgres schema, and row-level security keep the stack small and practical.",
    icon: ShieldCheck,
  },
];

const demoBlocks = [
  "Executive Summary",
  "Problem / Solution",
  "Market Insight",
  "Team Notes",
  "Next Steps",
];

export default function HomePage() {
  return (
    <main>
      <section className="overflow-hidden pt-10 sm:pt-14">
        <Container className="relative pb-20 pt-10 sm:pb-24 sm:pt-16">
          <div className="absolute inset-x-0 top-0 -z-10 h-[480px] rounded-[3rem] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.16),transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(237,242,238,0.86))]" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <AnimatedGroup>
                <Badge>Case competition starter</Badge>
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl [font-family:var(--font-display)]">
                  Build the pitch, demo the product, and keep your team moving.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  A fast Next.js + Supabase starter for hackathons, case competitions, and investor-style demos.
                  Clean auth, a polished dashboard, and just enough structure to ship.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/sign-up">
                      Start building
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/dashboard">View dashboard</Link>
                  </Button>
                </div>
              </AnimatedGroup>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Setup time", value: "~10 min" },
                  { label: "Core stack", value: "Next + Supabase" },
                  { label: "Best for", value: "Live demos" },
                ].map((item) => (
                  <Card key={item.label} className="p-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="glass-panel relative overflow-hidden border-white/40 p-6 sm:p-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/70 to-transparent" />
              <div className="grid gap-4">
                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">Executive Summary</p>
                      <p className="mt-2 text-2xl font-semibold">Northstar Health</p>
                    </div>
                    <BarChart3 className="size-10 text-teal-300" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/80">
                    AI-assisted care navigation for underinsured patients with a focus on early intervention and guided scheduling.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {demoBlocks.map((block) => (
                    <Card key={block} className="border-slate-200/80 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Lightbulb className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{block}</p>
                          <p className="text-xs text-slate-500">Editable in the dashboard</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-24">
        <Container>
          <SectionHeader
            eyebrow="Built for speed"
            title="A starter that is opinionated enough to help and small enough to understand."
            description="The architecture stays close to the platform: App Router, server actions, Supabase SSR utilities, lightweight UI components, and documented setup."
          />
          <AnimatedGroup className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="p-6">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </Card>
              );
            })}
          </AnimatedGroup>
        </Container>
      </section>
    </main>
  );
}
