export function Label({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="text-sm font-medium text-slate-800" {...props}>
      {children}
    </label>
  );
}
