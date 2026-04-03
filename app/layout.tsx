import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { RouteTransition } from "@/components/layout/route-transition";
import { createServerClientSafe } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Anchor",
  description: "Ambient memory support for TBI survivors with privacy-first local object tracking.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createServerClientSafe();
  const {
    data: { user },
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  return (
    <html lang="en">
      <body className="min-h-screen text-[var(--foreground)] [font-family:var(--font-body)]">
        <div className="relative min-h-screen">
          <Navbar user={user} />
          <RouteTransition>{children}</RouteTransition>
        </div>
      </body>
    </html>
  );
}
