import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[2rem] border border-[var(--border)] text-[var(--foreground)] shadow-[0_20px_60px_rgba(0,0,0,0.28)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
