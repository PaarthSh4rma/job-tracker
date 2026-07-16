import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "../../constants/application";
import { Input, Select, Textarea } from "../../components/ui";

export function ApplicationForm({
  values,
  errors,
  disabled,
  onChange,
  formId,
  onSubmit,
}) {
  const update = (field) => (event) => onChange(field, event.target.value);

  return (
    <form
      id={formId}
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={onSubmit}
      noValidate
    >
      <Input
        id={`${formId}-company`}
        label="Company"
        value={values.company}
        error={errors.company}
        disabled={disabled}
        required
        autoComplete="organization"
        onChange={update("company")}
      />
      <Input
        id={`${formId}-role`}
        label="Role"
        value={values.role}
        error={errors.role}
        disabled={disabled}
        required
        onChange={update("role")}
      />
      <Input
        id={`${formId}-application-date`}
        label="Application date"
        type="date"
        value={values.application_date}
        error={errors.application_date}
        disabled={disabled}
        required
        onChange={update("application_date")}
      />
      <Select
        id={`${formId}-status`}
        label="Status"
        value={values.status}
        error={errors.status}
        disabled={disabled}
        onChange={update("status")}
      >
        {APPLICATION_STATUSES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input
        id={`${formId}-location`}
        label="Location"
        value={values.location}
        disabled={disabled}
        autoComplete="address-level2"
        onChange={update("location")}
      />
      <Input
        id={`${formId}-job-url`}
        label="Job URL"
        type="url"
        placeholder="https://…"
        value={values.job_url}
        error={errors.job_url}
        disabled={disabled}
        inputMode="url"
        onChange={update("job_url")}
      />
      <Select
        id={`${formId}-employment-type`}
        label="Employment type"
        value={values.employment_type}
        disabled={disabled}
        onChange={update("employment_type")}
      >
        {EMPLOYMENT_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Select
        id={`${formId}-work-mode`}
        label="Work mode"
        value={values.work_mode}
        disabled={disabled}
        onChange={update("work_mode")}
      >
        {WORK_MODES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input
        id={`${formId}-salary`}
        label="Salary"
        placeholder="e.g. $90k–$110k"
        value={values.salary_text}
        disabled={disabled}
        onChange={update("salary_text")}
      />
      <Input
        id={`${formId}-source`}
        label="Source"
        placeholder="e.g. LinkedIn, referral"
        value={values.source}
        disabled={disabled}
        onChange={update("source")}
      />
      <Input
        id={`${formId}-contact-name`}
        label="Recruiter or contact name"
        value={values.contact_name}
        disabled={disabled}
        autoComplete="name"
        onChange={update("contact_name")}
      />
      <Input
        id={`${formId}-contact-email`}
        label="Recruiter or contact email"
        type="email"
        value={values.contact_email}
        error={errors.contact_email}
        disabled={disabled}
        inputMode="email"
        autoComplete="email"
        onChange={update("contact_email")}
      />
      <Input
        id={`${formId}-follow-up`}
        label="Next follow-up"
        type="date"
        value={values.next_follow_up_date}
        disabled={disabled}
        onChange={update("next_follow_up_date")}
      />
      <div className="sm:col-span-2">
        <Textarea
          id={`${formId}-notes`}
          label="Notes"
          placeholder="Add context, conversation notes, or useful next steps."
          value={values.notes}
          disabled={disabled}
          onChange={update("notes")}
        />
      </div>
    </form>
  );
}
