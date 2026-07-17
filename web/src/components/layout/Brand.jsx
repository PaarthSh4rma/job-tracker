import { PRODUCT } from "../../config/product";
import { cn } from "../../lib/cn";

export function BrandMark({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <path
        d="M8 21.5 13 16l3.6 3.5L24 11"
        className="fill-none stroke-white stroke-[2.5]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="11" r="2" className="fill-white" />
    </svg>
  );
}

export function Brand({ compact = false, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      {!compact && (
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-tight text-ink">
            {PRODUCT.name}
          </p>
          <p className="text-xs leading-4 text-muted">
            {PRODUCT.tagline}
          </p>
        </div>
      )}
    </div>
  );
}
