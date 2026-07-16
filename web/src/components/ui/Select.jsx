import { cn } from "../../lib/cn";

export function Select({ id, label, error, className, children, ...props }) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "min-h-11 w-full rounded-xl border bg-surface px-3.5 text-[15px] text-ink shadow-control outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-subtle",
          error ? "border-danger-500" : "border-line",
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="text-sm text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
