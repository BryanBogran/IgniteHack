import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold text-slate-950 [font-family:var(--font-display)]">Connect Supabase to continue</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your environment, then run the SQL migration in the Supabase dashboard. The landing page works without Supabase, but auth and the dashboard require it.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/sign-up">Go to auth setup</Link>
        </Button>
      </div>
    </Card>
  );
}
