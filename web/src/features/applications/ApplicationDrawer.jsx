import { Button, Modal } from "../../components/ui";
import { NavigationIcon } from "../../components/layout/NavigationIcon";
import {
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "../../constants/application";
import { ApplicationForm } from "./ApplicationForm";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import {
  formatDate,
  formatDateTime,
  hasApplicationChanges,
  safeHttpUrl,
} from "./applicationModel";

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? "Not set";
}

function Detail({ label, children, full = false }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-bold uppercase tracking-wider text-faint">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-6 text-ink">{children || "Not set"}</dd>
    </div>
  );
}

function DetailsView({ application }) {
  const jobUrl = safeHttpUrl(application.job_url);

  return (
    <div className="space-y-7">
      <div>
        <ApplicationStatusBadge status={application.status} />
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          {application.company}
        </h3>
        <p className="mt-1 text-base text-muted">{application.role}</p>
      </div>

      <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Detail label="Application date">
          {formatDate(application.application_date)}
        </Detail>
        <Detail label="Next follow-up">
          {formatDate(application.next_follow_up_date)}
        </Detail>
        <Detail label="Location">{application.location}</Detail>
        <Detail label="Source">{application.source}</Detail>
        <Detail label="Employment type">
          {optionLabel(EMPLOYMENT_TYPES, application.employment_type)}
        </Detail>
        <Detail label="Work mode">
          {optionLabel(WORK_MODES, application.work_mode)}
        </Detail>
        <Detail label="Salary">{application.salary_text}</Detail>
        <Detail label="Recruiter name">{application.contact_name}</Detail>
        <Detail label="Recruiter email">
          {application.contact_email ? (
            <a
              className="font-medium text-brand-700 underline-offset-4 hover:underline"
              href={`mailto:${application.contact_email}`}
            >
              {application.contact_email}
            </a>
          ) : null}
        </Detail>
        <Detail label="Job posting">
          {jobUrl ? (
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Open job posting
              <NavigationIcon name="external" className="size-4" />
            </a>
          ) : (
            "No job link"
          )}
        </Detail>
        <Detail label="Notes" full>
          {application.notes ? (
            <p className="whitespace-pre-wrap text-[15px] leading-7">
              {application.notes}
            </p>
          ) : (
            <span className="text-muted">No notes added.</span>
          )}
        </Detail>
        <Detail label="Created">{formatDateTime(application.created_at)}</Detail>
        <Detail label="Last updated">{formatDateTime(application.updated_at)}</Detail>
      </dl>
    </div>
  );
}

export function ApplicationDrawer({
  mode,
  application,
  values,
  errors,
  saving,
  onChange,
  onSubmit,
  onClose,
  onEdit,
  onDelete,
}) {
  const editing = mode === "edit";
  const creating = mode === "create";
  const formMode = editing || creating;
  const dirty = formMode && hasApplicationChanges(values, creating ? null : application);
  const formId = creating ? "create-application" : "edit-application";
  const jobUrl = safeHttpUrl(application?.job_url);

  return (
    <Modal
      open={Boolean(mode)}
      onClose={onClose}
      title={
        creating
          ? "Add application"
          : editing
            ? `Edit ${application?.company ?? "application"}`
            : "Application details"
      }
      description={
        creating
          ? "Capture the details you need now. Optional fields can be completed later."
          : editing && dirty
            ? "You have unsaved changes."
            : undefined
      }
      className="max-w-2xl overflow-hidden"
      focusKey={mode}
    >
      <div className="flex-1 overflow-y-auto py-6">
        {formMode ? (
          <ApplicationForm
            values={values}
            errors={errors}
            disabled={saving}
            onChange={onChange}
            formId={formId}
            onSubmit={onSubmit}
          />
        ) : application ? (
          <DetailsView application={application} />
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-line bg-surface py-4">
        {formMode ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" disabled={saving} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              loading={saving}
              disabled={!dirty}
            >
              {saving ? "Saving…" : creating ? "Add application" : "Save changes"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="text-danger-700 hover:bg-danger-50 hover:text-danger-800"
              onClick={onDelete}
            >
              <NavigationIcon name="trash" />
              Delete
            </Button>
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              {jobUrl && (
                <a
                  href={jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-control transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <NavigationIcon name="external" />
                  Open job posting
                </a>
              )}
              <Button onClick={onEdit}>
                <NavigationIcon name="edit" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
