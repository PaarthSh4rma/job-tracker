import { Card } from "../../components/ui";
import { APPLICATION_STATUSES } from "../../constants/application";
import { cn } from "../../lib/cn";
import { formatDate, todayValue } from "./applicationModel";
import { applicationStatusPresentation } from "./applicationStatus";
import { groupApplicationsByPipeline } from "../insights/analyticsModel";

function followUpLabel(application, today) {
  const value = application.next_follow_up_date;
  if (!value) return null;
  if (value < today) return "Follow-up overdue";
  if (value === today) return "Follow-up due today";
  return `Follow-up ${formatDate(value)}`;
}

export function ApplicationsPipeline({
  applications,
  updatingId,
  onOpen,
  onStatusChange,
}) {
  const groups = groupApplicationsByPipeline(applications);
  const today = todayValue();

  return (
    <div
      className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7"
      aria-label="Application pipeline"
    >
      {APPLICATION_STATUSES.map((status) => {
        const items = groups[status.value];
        const presentation = applicationStatusPresentation(status.value);
        return (
          <section
            key={status.value}
            className="min-w-0 rounded-2xl border border-line bg-subtle/50 p-3"
            aria-labelledby={`pipeline-${status.value}`}
          >
            <div className="flex items-center justify-between gap-3 px-1 py-1">
              <h2
                id={`pipeline-${status.value}`}
                className="text-sm font-semibold text-ink"
              >
                {status.label}
              </h2>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-line">
                {items.length}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-faint">
                No applications
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {items.map((application) => {
                  const followUp = followUpLabel(application, today);
                  return (
                    <li key={application.id}>
                      <Card className="p-3 shadow-none transition-colors hover:bg-subtle">
                        <button
                          type="button"
                          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          onClick={() => onOpen(application.id)}
                        >
                          <span className="block truncate text-sm font-semibold text-ink">
                            {application.company}
                          </span>
                          <span className="mt-1 block truncate text-xs text-muted">
                            {application.role}
                          </span>
                          <span className="mt-3 block text-xs text-faint">
                            {formatDate(application.application_date)}
                          </span>
                          {followUp && (
                            <span
                              className={cn(
                                "mt-2 block text-xs font-semibold",
                                followUp.includes("overdue") ||
                                  followUp.includes("today")
                                  ? "text-danger-700"
                                  : "text-muted",
                              )}
                            >
                              {followUp}
                            </span>
                          )}
                        </button>
                        <div className="mt-3 border-t border-line pt-3">
                          <label
                            htmlFor={`pipeline-status-${application.id}`}
                            className="sr-only"
                          >
                            Status for {application.company}
                          </label>
                          <select
                            id={`pipeline-status-${application.id}`}
                            value={application.status}
                            disabled={updatingId !== null}
                            className={cn(
                              "min-h-9 w-full rounded-full border-0 px-2 text-xs font-semibold outline-none ring-1 ring-inset focus:ring-2 focus:ring-brand-500 disabled:opacity-60",
                              presentation.className,
                            )}
                            onChange={(event) =>
                              onStatusChange(application, event.target.value)
                            }
                          >
                            {APPLICATION_STATUSES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
