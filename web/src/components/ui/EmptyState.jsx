import { cn } from "../../lib/cn";

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn("px-5 py-12 text-center", className)}>
      {icon && (
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
