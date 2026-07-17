import { cn } from "../../lib/cn";

export function SelectChevron({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 fill-none stroke-current text-muted",
        className,
      )}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

export function Select({
  id,
  label,
  error,
  hint,
  required,
  className,
  selectClassName,
  children,
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined;
  const messageId = errorId ?? (hint ? `${id}-hint` : undefined);

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
      <div className="relative">
        <select
          id={id}
          className={cn(
            "min-h-11 w-full appearance-none rounded-xl border bg-surface py-2 pl-3.5 pr-10 text-[15px] text-ink shadow-control outline-none transition-colors focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-faint",
            error ? "border-danger-500" : "border-line",
            selectClassName,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={messageId}
          required={required}
          {...props}
        >
          {children}
        </select>
        <SelectChevron />
      </div>
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
