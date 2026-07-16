const STATUS_PRESENTATION = Object.freeze({
  saved: {
    label: "Saved",
    className: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
  },
  applied: {
    label: "Applied",
    className: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-800",
  },
  screening: {
    label: "Screening",
    className: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-800",
  },
  interview: {
    label: "Interview",
    className: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800",
  },
  offer: {
    label: "Offer",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-800",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-stone-100 text-stone-700 ring-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700",
  },
});

export function applicationStatusPresentation(status) {
  return STATUS_PRESENTATION[status] ?? {
    label: status || "Unknown",
    className: "bg-subtle text-muted ring-line",
  };
}
