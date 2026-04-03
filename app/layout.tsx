import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { RouteTransition } from "@/components/layout/route-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memento",
  description: "Ambient memory support for TBI survivors with privacy-first local object tracking.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[var(--foreground)] [font-family:var(--font-body)]">
        <div className="relative min-h-screen">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Navbar user={null} />
          <RouteTransition>
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </RouteTransition>
        </div>
      </body>
    </html>
  );
}
