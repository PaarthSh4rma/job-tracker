import { Button, Card, EmptyState, SectionHeading, Skeleton } from "../../components/ui";
import { NavigationIcon } from "../../components/layout/NavigationIcon";
import { formatDate } from "../applications/applicationModel";

export function MetricCard({ label, value, context, emphasis = false }) {
  return (
    <Card className={emphasis ? "p-5 ring-1 ring-brand-200 sm:p-6" : "p-5"}>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {context && <p className="mt-2 text-xs leading-5 text-faint">{context}</p>}
    </Card>
  );
}

export function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="space-y-4 p-5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-3 w-3/4" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item} className="space-y-4 p-6">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-40" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DistributionBars({
  title,
  description,
  data,
  emptyMessage = "No data available yet.",
  limit,
}) {
  const visible = (limit ? data.slice(0, limit) : data).filter(
    ({ count }) => count > 0,
  );
  const maximum = Math.max(...visible.map(({ count }) => count), 0);

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeading title={title} description={description} />
      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{emptyMessage}</p>
      ) : (
        <div className="mt-6 space-y-4" role="list" aria-label={title}>
          {visible.map(({ value, label, count }) => (
            <div key={value ?? label} role="listitem">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate font-medium text-ink">{label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-muted">
                  {count}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${(count / maximum) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function WeeklyActivity({ activity, title = "Weekly application activity" }) {
  const maximum = Math.max(...activity.weeks.map(({ count }) => count), 0);
  const hasActivity = activity.weeks.some(({ count }) => count > 0);

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeading
        title={title}
        description="Calendar weeks begin Monday. The latest 10 weeks are shown."
      />
      {!hasActivity ? (
        <EmptyState
          icon={<NavigationIcon name="calendar" />}
          title="No dated activity in this window"
          description="Add application dates to see weekly activity."
          className="px-0 py-10"
        />
      ) : (
        <div className="mt-6 space-y-3" role="list" aria-label={title}>
          {activity.weeks.map(({ weekStart, count }) => (
            <div
              key={weekStart}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)_2rem] items-center gap-3"
              role="listitem"
            >
              <span className="text-xs font-medium text-muted">
                {formatDate(weekStart)}
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: maximum ? `${(count / maximum) * 100}%` : "0%" }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-right text-sm font-semibold tabular-nums text-ink">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
      {activity.excludedWithoutDate > 0 && (
        <p className="mt-5 text-xs leading-5 text-faint">
          {activity.excludedWithoutDate} application
          {activity.excludedWithoutDate === 1 ? " is" : "s are"} excluded because
          no valid application date is stored.
        </p>
      )}
    </Card>
  );
}

function FollowUpRow({ application, urgency, updating, onOpen, onUpdate }) {
  return (
    <li className="rounded-xl border border-line p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          onClick={() => onOpen(application.id)}
        >
          <span className="block truncate font-semibold text-ink">
            {application.company}
          </span>
          <span className="mt-1 block truncate text-sm text-muted">
            {application.role}
          </span>
          <span className="mt-2 block text-xs font-bold uppercase tracking-wider text-danger-700">
            {urgency}
          </span>
        </button>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label
              htmlFor={`follow-up-${application.id}`}
              className="block text-xs font-medium text-muted"
            >
              Follow-up date
            </label>
            <input
              id={`follow-up-${application.id}`}
              type="date"
              value={application.next_follow_up_date ?? ""}
              disabled={updating}
              className="mt-1 min-h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:opacity-60"
              onChange={(event) => onUpdate(application, event.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={updating || !application.next_follow_up_date}
            onClick={() => onUpdate(application, "")}
          >
            Clear
          </Button>
        </div>
      </div>
    </li>
  );
}

export function FollowUpPanel({ followUps, updatingId, onOpen, onUpdate }) {
  const urgent = [
    ...followUps.overdue.map((application) => ({ application, urgency: "Overdue" })),
    ...followUps.dueToday.map((application) => ({ application, urgency: "Due today" })),
  ];
  const upcoming = followUps.upcoming.slice(0, 4);

  return (
    <Card className="p-5 sm:p-6">
      <SectionHeading
        title="Follow-ups"
        description={
          urgent.length
            ? `${urgent.length} application${urgent.length === 1 ? " needs" : "s need"} attention.`
            : "No overdue or due-today follow-ups."
        }
      />
      {urgent.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {urgent.map(({ application, urgency }) => (
            <FollowUpRow
              key={application.id}
              application={application}
              urgency={urgency}
              updating={updatingId !== null}
              onOpen={onOpen}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      ) : upcoming.length === 0 ? (
        <p className="mt-5 text-sm text-muted">
          Schedule a follow-up from an application to track it here.
        </p>
      ) : null}

      {upcoming.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-ink">Upcoming</h3>
          <ul className="mt-3 space-y-2">
            {upcoming.map((application) => (
              <li key={application.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 rounded-lg px-2 py-2 text-left hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  onClick={() => onOpen(application.id)}
                >
                  <span className="truncate text-sm font-medium text-ink">
                    {application.company} · {application.role}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {formatDate(application.next_follow_up_date)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {followUps.unscheduled.length > 0 && (
        <p className="mt-5 text-xs leading-5 text-faint">
          {followUps.unscheduled.length} active application
          {followUps.unscheduled.length === 1 ? " has" : "s have"} no follow-up
          scheduled.
        </p>
      )}
    </Card>
  );
}
