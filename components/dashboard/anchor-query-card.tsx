import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AnchorQueryResult } from "@/lib/anchor/types";

const starterPrompts = [
  "Where are my keys?",
  "When did you last see my glasses?",
  "Is my wallet visible right now?",
];

export function AnchorQueryCard({
  initialQuery,
  result,
}: {
  initialQuery: string;
  result: AnchorQueryResult | null;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Ask Anchor</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Keep the language simple and direct. Anchor supports location, recency, and visibility checks for tracked
            essentials.
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
          <Search className="size-5" />
        </div>
      </div>

      <form action="/dashboard" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          name="q"
          defaultValue={initialQuery}
          placeholder="Where are my keys?"
          aria-label="Ask Anchor where an object was last seen"
        />
        <Button type="submit">Run query</Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {starterPrompts.map((prompt) => (
          <a
            key={prompt}
            href={`/dashboard?q=${encodeURIComponent(prompt)}`}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {prompt}
          </a>
        ))}
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Answer</p>
        <p className="mt-3 text-base leading-7 text-slate-900">
          {result?.answer ??
            "Ask about a tracked object to get its last known location, latest timestamp, and whether it is still in view."}
        </p>
      </div>
    </Card>
  );
}
