import Link from "next/link";
import { ArrowRight, Brain, Camera, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const features = [
  {
    title: "Built for memory loss, not perfect habits",
    description: "Anchor removes manual logging and tagging so the workflow still works when short-term memory encoding does not.",
    icon: Sparkles,
  },
  {
    title: "Local-first room intelligence",
    description: "A single corner webcam watches trusted drop zones, extracts object metadata, and discards frames immediately.",
    icon: Camera,
  },
  {
    title: "Last-known-location memory",
    description: "When an item disappears into a drawer or under clutter, Anchor still returns the final visible location and time.",
    icon: ShieldCheck,
  },
];

const demoBlocks = [
  "Where are my keys?",
  "Last seen on entry table",
  "Glasses visible now",
  "Wallet left frame",
  "Frames deleted instantly",
];

export default function HomePage() {
  const primaryHref = hasSupabaseEnv() ? "/sign-up" : "/dashboard";
  const primaryLabel = hasSupabaseEnv() ? "Open demo" : "Launch local demo";

  return (
    <main>
      <section className="overflow-hidden pt-10 sm:pt-14">
        <Container className="relative pb-20 pt-10 sm:pb-24 sm:pt-16">
          <div className="absolute inset-x-0 top-0 -z-10 h-[480px] rounded-[3rem] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.16),transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(237,242,238,0.86))]" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <AnimatedGroup>
                <Badge>Privacy-first accessibility demo</Badge>
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl [font-family:var(--font-display)]">
                  Ambient object memory for people who cannot rely on memory alone.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Project Anchor helps TBI survivors recover the last known location of essentials like keys, glasses,
                  and wallets with zero-friction local vision and a calm query interface.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/dashboard?q=Where%20are%20my%20keys%3F">Ask Anchor</Link>
                  </Button>
                </div>
              </AnimatedGroup>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Compute model", value: "Edge AI only" },
                  { label: "Memory output", value: "SQLite metadata" },
                  { label: "Primary user", value: "TBI survivors" },
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
                      <p className="text-sm text-white/70">Anchor response</p>
                      <p className="mt-2 text-2xl font-semibold">Your keys were last seen on the entry table.</p>
                    </div>
                    <MapPinned className="size-10 text-teal-300" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/80">
                    8:14 PM, confidence 91%. The object is currently out of view, so this is the last confirmed location
                    before disappearance.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {demoBlocks.map((block) => (
                    <Card key={block} className="border-slate-200/80 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Brain className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{block}</p>
                          <p className="text-xs text-slate-500">Live from local memory state</p>
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
            eyebrow="Why it matters"
            title="A niche accessibility tool with a big demo moment and an even bigger human need."
            description="Project Anchor combines local computer vision, last-known-state tracking, and a simple dashboard so the user never needs to remember to remember."
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
