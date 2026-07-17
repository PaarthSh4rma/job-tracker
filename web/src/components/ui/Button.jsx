import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const variants = {
  primary:
    "bg-brand-600 text-white shadow-control hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "border border-line bg-surface text-ink shadow-control hover:bg-subtle",
  ghost: "text-muted hover:bg-subtle hover:text-ink",
  danger:
    "bg-danger-600 text-white shadow-control hover:bg-danger-700 active:bg-danger-800",
};

const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});
