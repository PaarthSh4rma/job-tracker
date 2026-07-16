import { createElement } from "react";
import { cn } from "../../lib/cn";

export function Card({ children, className, as = "section", ...props }) {
  return createElement(
    as,
    {
      className: cn(
        "rounded-2xl border border-line bg-surface shadow-card",
        className,
      ),
      ...props,
    },
    children,
  );
}
