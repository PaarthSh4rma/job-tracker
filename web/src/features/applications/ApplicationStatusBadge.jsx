import { cn } from "../../lib/cn";
import { applicationStatusPresentation } from "./applicationStatus";

export function ApplicationStatusBadge({ status, className }) {
  const presentation = applicationStatusPresentation(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        presentation.className,
        className,
      )}
    >
      {presentation.label}
    </span>
  );
}
