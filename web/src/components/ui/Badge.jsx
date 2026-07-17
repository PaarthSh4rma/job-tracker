import { cn } from "../../lib/cn";

const tones = {
  neutral: "bg-subtle text-muted ring-line",
  brand: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-emerald-950 dark:text-brand-200 dark:ring-brand-800",
  success: "bg-success-50 text-success-700 ring-success-200 dark:bg-emerald-950 dark:text-success-200 dark:ring-emerald-800",
  warning: "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800",
};

export function Badge({ children, tone = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
