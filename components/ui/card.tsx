import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[2rem] border border-[var(--border)] bg-white/90 shadow-[0_20px_60px_rgba(15,23,32,0.08)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
