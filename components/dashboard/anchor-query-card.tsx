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
    <Card
      className="border-white/10 bg-[linear-gradient(180deg,rgba(13,25,33,0.96),rgba(10,18,25,0.92))] p-6"
      aria-labelledby="search-heading"
      aria-describedby="search-description"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="search-heading" className="text-sm font-semibold text-[var(--foreground)]">
            Ask Anchor
          </h2>
          <p id="search-description" className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Keep the language simple and direct. Anchor supports location, recency, and visibility checks for tracked
            essentials.
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
          <Search className="size-5" aria-hidden="true" />
        </div>
      </div>

      <form action="/dashboard" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="anchor-query-input" className="sr-only">
          Ask Anchor a question
        </label>
        <Input
          id="anchor-query-input"
          name="q"
          defaultValue={initialQuery}
          placeholder="Where are my keys?"
          aria-describedby="search-description search-answer"
        />
        <Button type="submit">Run query</Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {starterPrompts.map((prompt) => (
          <a
            key={prompt}
            href={`/dashboard?q=${encodeURIComponent(prompt)}`}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
          >
            {prompt}
          </a>
        ))}
      </div>

      <div id="search-answer" className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/4 p-5" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Answer</p>
        <p className="mt-3 text-base leading-7 text-[var(--foreground)]">
          {result?.answer ??
            "Ask about a tracked object to get its last known location, latest timestamp, and whether it is still in view."}
        </p>
      </div>
    </Card>
  );
}
