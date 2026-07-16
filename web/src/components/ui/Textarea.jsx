import { cn } from "../../lib/cn";

export function Textarea({ id, label, error, className, ...props }) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "min-h-28 w-full resize-y rounded-xl border bg-surface px-3.5 py-3 text-[15px] text-ink shadow-control outline-none transition placeholder:text-faint focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-subtle",
          error ? "border-danger-500" : "border-line",
          className,
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
