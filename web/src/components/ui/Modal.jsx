import { useEffect, useRef } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "./IconButton";

export function Modal({ open, onClose, title, children, className }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousActiveElement = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousActiveElement?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/45"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <section
        className={cn(
          "relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-surface p-5 shadow-panel",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <IconButton label="Close dialog" ref={closeButtonRef} onClick={onClose}>
            <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}
