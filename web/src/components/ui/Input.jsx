import { cn } from "../../lib/cn";

export function Input({
  id,
  label,
  error,
  hint,
  required,
  className,
  inputClassName,
  ...props
}) {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
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
      <input
        id={id}
        className={cn(
          "min-h-11 w-full rounded-xl border bg-surface px-3.5 text-[15px] text-ink shadow-control outline-none transition placeholder:text-faint focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-faint",
          error ? "border-danger-500" : "border-line",
          inputClassName,
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={messageId}
        required={required}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger-700 dark:text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
