import { Card, EmptyState, Skeleton } from "../../components/ui";
import { NavigationIcon } from "../../components/layout/NavigationIcon";
import {
  APPLICATION_STATUSES,
  WORK_MODES,
} from "../../constants/application";
import { cn } from "../../lib/cn";
import { formatDate, safeHttpUrl } from "./applicationModel";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { applicationStatusPresentation } from "./applicationStatus";

function labelFor(options, value, fallback = "Not set") {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

function JobLink({ url, company, compact = false }) {
  const safeUrl = safeHttpUrl(url);

  if (!safeUrl) {
    return (
      <span className={compact ? "text-xs text-faint" : "text-sm text-faint"}>
        No job link
      </span>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`Open job posting for ${company} in a new tab`}
      onClick={(event) => event.stopPropagation()}
    >
      {!compact && "Job link"}
      <NavigationIcon name="external" className="size-4" />
    </a>
  );
}

function StatusControl({
  application,
  updating,
  onStatusChange,
  idPrefix,
}) {
  const controlId = `${idPrefix}-${application.id}`;
  const presentation = applicationStatusPresentation(application.status);

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <label className="sr-only" htmlFor={controlId}>
        Status for {application.company}
      </label>
      <select
        id={controlId}
        value={application.status}
        disabled={updating}
        className={cn(
          "min-h-9 min-w-36 rounded-full border-0 px-3 text-xs font-semibold outline-none ring-1 ring-inset transition focus:ring-2 focus:ring-brand-500 disabled:cursor-wait disabled:opacity-60",
          presentation.className,
        )}
        onChange={(event) => onStatusChange(application, event.target.value)}
      >
        {APPLICATION_STATUSES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ApplicationsLoading() {
  return (
    <>
      <Card className="hidden overflow-hidden md:block" aria-label="Loading applications">
        <div className="space-y-1 p-3">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="grid grid-cols-[minmax(0,1.5fr)_9rem_8rem_9rem] gap-5 px-3 py-4"
            >
              <Skeleton className="h-10" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-3 md:hidden" aria-label="Loading applications">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="space-y-4 p-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10" />
          </Card>
        ))}
      </div>
    </>
  );
}

function EmptyApplications({ filtered, onAdd, onClear }) {
  return (
    <Card>
      <EmptyState
        icon={<NavigationIcon name={filtered ? "search" : "inbox"} />}
        title={filtered ? "No applications match" : "No applications yet"}
        description={
          filtered
            ? "Try changing your search or clearing one of the active filters."
            : "Add your first application to start building your private workspace."
        }
        action={
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            onClick={filtered ? onClear : onAdd}
          >
            {filtered ? "Clear filters" : "Add application"}
          </button>
        }
      />
    </Card>
  );
}

export function ApplicationsList({
  applications,
  totalCount,
  filtered,
  updatingId,
  onOpen,
  onStatusChange,
  onAdd,
  onClear,
}) {
  if (applications.length === 0) {
    return (
      <EmptyApplications
        filtered={filtered && totalCount > 0}
        onAdd={onAdd}
        onClear={onClear}
      />
    );
  }

  return (
    <>
      <Card className="hidden overflow-hidden md:block">
        <div className="max-h-[calc(100vh-21rem)] min-h-72 overflow-y-auto">
          <table className="w-full table-fixed text-left">
            <thead className="sticky top-0 z-10 border-b border-line bg-subtle">
              <tr>
                <th className="w-[34%] px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Opportunity
                </th>
                <th className="w-[19%] px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Status
                </th>
                <th className="w-[17%] px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Applied
                </th>
                <th className="w-[18%] px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                  Work mode
                </th>
                <th className="w-[12%] px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="group cursor-pointer transition-colors hover:bg-subtle/70"
                  onClick={() => onOpen(application.id)}
                >
                  <td className="px-5 py-4">
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
                        {application.location ? ` · ${application.location}` : ""}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <StatusControl
                      application={application}
                      updating={updatingId !== null}
                      onStatusChange={onStatusChange}
                      idPrefix="desktop-status"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {formatDate(application.application_date)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {labelFor(WORK_MODES, application.work_mode)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <JobLink
                      url={application.job_url}
                      company={application.company}
                      compact
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-3 md:hidden">
        {applications.map((application) => (
          <Card
            key={application.id}
            className="cursor-pointer p-4 transition-colors hover:bg-subtle/60"
            onClick={() => onOpen(application.id)}
          >
            <button
              type="button"
              className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              onClick={() => onOpen(application.id)}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">
                    {application.company}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted">
                    {application.role}
                  </span>
                </span>
                <ApplicationStatusBadge status={application.status} />
              </span>
              <span className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-faint">
                    Applied
                  </span>
                  <span className="mt-1 block text-muted">
                    {formatDate(application.application_date)}
                  </span>
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-faint">
                    Work mode
                  </span>
                  <span className="mt-1 block text-muted">
                    {labelFor(WORK_MODES, application.work_mode)}
                  </span>
                </span>
              </span>
            </button>
            <div className="mt-4 border-t border-line pt-4">
              <StatusControl
                application={application}
                updating={updatingId !== null}
                onStatusChange={onStatusChange}
                idPrefix="mobile-status"
              />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
