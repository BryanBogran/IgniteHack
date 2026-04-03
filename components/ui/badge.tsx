import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "soft" | "outline";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" && "bg-[var(--foreground)] text-slate-950",
        variant === "soft" && "bg-[var(--accent-soft)] text-[var(--accent)]",
        variant === "outline" && "border border-[var(--border)] text-[var(--muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
