import { cn } from "../../lib/cn";

const tones = {
  error: "border-danger-200 bg-danger-50 text-danger-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  success: "border-success-200 bg-success-50 text-success-800 dark:border-success-700 dark:bg-emerald-950 dark:text-success-200",
  info: "border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-700 dark:bg-emerald-950 dark:text-brand-200",
};

export function Alert({ children, tone = "info", title, className }) {
  const role = tone === "error" ? "alert" : "status";

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tones[tone],
        className,
      )}
      role={role}
    >
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
