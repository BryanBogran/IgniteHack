import { Card } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-panel border-white/50 p-8 sm:p-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 [font-family:var(--font-display)]">
          {title}
        </h1>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-6 border-t border-slate-200/80 pt-5">{footer}</div> : null}
    </Card>
  );
}
