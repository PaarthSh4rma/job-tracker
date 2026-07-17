import { useEffect, useId, useRef } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "./IconButton";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  variant = "drawer",
  closeDisabled = false,
  focusKey,
  panelId,
}) {
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousActiveElement = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !closeDisabled) onCloseRef.current();
      if (event.key !== "Tab") return;

      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)];
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => {
        if (previousActiveElement?.isConnected) previousActiveElement.focus?.();
        else if (!document.querySelector('[role="dialog"]')) {
          document.querySelector("[data-focus-fallback]")?.focus?.();
        }
      }, 0);
    };
  }, [closeDisabled, open]);

  useEffect(() => {
    if (open && focusKey !== undefined) {
      closeButtonRef.current?.focus();
    }
  }, [focusKey, open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        variant === "dialog"
          ? "items-center justify-center p-4 sm:p-6"
          : "items-stretch justify-end",
      )}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[var(--overlay)]"
        aria-label="Close dialog"
        tabIndex={-1}
        disabled={closeDisabled}
        onClick={onClose}
      />
      <section
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex w-full flex-col overflow-y-auto border-line bg-surface shadow-panel outline-none",
          variant === "dialog"
            ? "max-h-[calc(100dvh-2rem)] max-w-lg rounded-2xl border p-5 sm:max-h-[calc(100dvh-3rem)] sm:p-6"
            : "h-dvh max-w-sm border-l p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5",
          className,
        )}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="break-words text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton
            label="Close dialog"
            ref={closeButtonRef}
            disabled={closeDisabled}
            onClick={onClose}
          >
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
