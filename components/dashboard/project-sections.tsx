import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

const blocks = [
  {
    title: "Executive Summary",
    body: "Summarize the opportunity in one sentence, then anchor the story with measurable traction or a clear wedge into the market.",
  },
  {
    title: "Problem / Solution",
    body: "Define the pain precisely, then explain why your approach wins on speed, cost, usability, or defensibility.",
  },
  {
    title: "Market Insight",
    body: "Capture TAM, key trends, customer willingness to pay, and the market shift that makes this moment attractive.",
  },
  {
    title: "Next Steps",
    body: "Use this block to frame the next experiment, pilot plan, or ask for judges, mentors, or investors.",
  },
];

export function ProjectSections() {
  return (
    <Card className="p-6">
      <SectionHeader
        eyebrow="Story blocks"
        title="Keep the pitch narrative visible while the team builds"
        description="These placeholders are intentionally simple so the team can align on the message fast."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.title} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
            <h3 className="text-base font-semibold text-slate-950">{block.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{block.body}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
