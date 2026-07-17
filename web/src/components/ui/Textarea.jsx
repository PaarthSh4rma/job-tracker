import { cn } from "../../lib/cn";

export function Textarea({ id, label, error, hint, required, className, ...props }) {
  const errorId = error ? `${id}-error` : undefined;
  const messageId = errorId ?? (hint ? `${id}-hint` : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="ml-1 text-danger-700 dark:text-red-300" aria-hidden="true">
              *
            </span>
          )}
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
        aria-describedby={messageId}
        required={required}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger-700 dark:text-red-300">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
