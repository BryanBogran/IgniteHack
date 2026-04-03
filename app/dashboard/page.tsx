import { redirect } from "next/navigation";
import { AnchorHero } from "@/components/dashboard/anchor-hero";
import { AnchorObjectsGrid } from "@/components/dashboard/anchor-objects-grid";
import { AnchorQueryCard } from "@/components/dashboard/anchor-query-card";
import { AnchorStats } from "@/components/dashboard/anchor-stats";
import { AnchorSystemCard } from "@/components/dashboard/anchor-system-card";
import { AnchorTimeline } from "@/components/dashboard/anchor-timeline";
import { demoProfile } from "@/lib/anchor/demo";
import { answerAnchorQuery } from "@/lib/anchor/query";
import { getAnchorDashboardData } from "@/lib/anchor/store";
import { createServerClientSafe } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function getDashboardProfile() {
  if (!hasSupabaseEnv()) {
    return demoProfile;
  }

  const supabase = await createServerClientSafe();
  if (!supabase) {
    return demoProfile;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { profile } = await getDashboardData(supabase, user.id);
  return profile;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const anchorParams = await ((searchParams ?? Promise.resolve({})) as Promise<{ q?: string | string[] }>);
  const queryText = typeof anchorParams.q === "string" ? anchorParams.q : "";
  const [anchorData, queryResult, profile] = await Promise.all([
    Promise.resolve(getAnchorDashboardData()),
    Promise.resolve(queryText ? answerAnchorQuery(queryText) : null),
    getDashboardProfile(),
  ]);

  return (
    <div className="space-y-8">
      <AnchorHero profile={profile} />
      <AnchorStats status={anchorData.status} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <AnchorQueryCard initialQuery={queryText} result={queryResult} />
          <AnchorObjectsGrid objects={anchorData.objects} />
          <AnchorTimeline sightings={anchorData.sightings} />
        </div>
        <div className="space-y-6">
          <AnchorSystemCard status={anchorData.status} />
        </div>
      </div>
    </div>
  );
}
