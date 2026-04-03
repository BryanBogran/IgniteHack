import { ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProfileRow } from "@/types/database";

export function MementoHero({ profile }: { profile: ProfileRow | null }) {
  return (
    <Card className="overflow-hidden border-white/50 bg-[linear-gradient(135deg,rgba(11,88,78,0.94),rgba(28,46,64,0.95))] p-6 text-white sm:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-white/14 text-white" variant="outline">
            Ambient Memory Prosthetic
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight [font-family:var(--font-display)] sm:text-5xl">
              Memento helps TBI survivors find the things memory leaves behind.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              A privacy-first room companion that watches trusted drop zones, stores only object metadata, and answers
              questions like “Where are my keys?” without requiring manual logging.
            </p>
          </div>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] border border-white/12 bg-white/8 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Privacy</p>
              <p className="mt-1 text-sm font-medium text-white/90">Frames discarded immediately</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Team</p>
              <p className="mt-1 text-sm font-medium text-white/90">{profile?.team_name ?? "Memento Demo"}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
