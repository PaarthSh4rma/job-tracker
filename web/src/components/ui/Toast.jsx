import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { ToastContext } from "./toastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) window.clearTimeout(timer);
    timersRef.current.delete(id);
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, tone = "success" }) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      setToasts((items) => [...items, { id, title, message, tone }]);
      const timer = window.setTimeout(() => dismiss(id), 4200);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast, dismiss }), [dismiss, showToast]);

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) window.clearTimeout(timer);
      timersRef.current.clear();
    },
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto w-full rounded-xl border bg-surface p-4 shadow-panel",
              toast.tone === "error"
                ? "border-danger-200 dark:border-red-800"
                : "border-line",
            )}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.message && (
                  <p className="mt-1 text-sm text-muted">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                className="min-h-10 rounded-lg px-2 text-sm font-medium text-muted hover:bg-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                onClick={() => dismiss(toast.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
