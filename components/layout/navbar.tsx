import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Anchor, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function Navbar({ user }: { user: User | null }) {
  const supabaseEnabled = hasSupabaseEnv();

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/75 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-white shadow-sm">
            <Anchor className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Project Anchor</p>
            <p className="text-xs text-slate-500">Ambient memory prosthetic</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Home</Link>
          </Button>
          {!supabaseEnabled ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Open demo</Link>
            </Button>
          ) : null}
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="sm">
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </form>
            </>
          ) : supabaseEnabled ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          ) : null}
        </nav>
      </Container>
    </header>
  );
}
