import { cn } from "../../lib/cn";

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-subtle motion-reduce:animate-none",
        className,
      )}
      aria-hidden="true"
    />
  );
}
