import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { LogOut, PanelTop } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Navbar({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/75 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
            <PanelTop className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Hackathon Starter</p>
            <p className="text-xs text-slate-500">Next.js + Supabase demo kit</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Home</Link>
          </Button>
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
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}
