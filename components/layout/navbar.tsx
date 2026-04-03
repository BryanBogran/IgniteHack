import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Navbar({ user }: { user: User | null }) {
  void user;

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#071015]/78 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-white shadow-sm">
            <Clock3 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Memento</p>
            <p className="text-xs text-[var(--muted)]">Simple dashboard</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard#search">Search</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard#items">Items</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard#system">System status</Link>
          </Button>
        </nav>
      </Container>
    </header>
  );
}
