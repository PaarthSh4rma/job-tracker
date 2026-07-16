import {
  APPLICATION_STATUS_VALUES,
  DEFAULT_APPLICATION_STATUS,
  DEFAULT_EMPLOYMENT_TYPE,
  DEFAULT_WORK_MODE,
} from "../../constants/application.js";

export const ALL_FILTER_VALUE = "all";

export const APPLICATION_SORTS = Object.freeze([
  { value: "application-date", label: "Application date" },
  { value: "recently-updated", label: "Recently updated" },
  { value: "company", label: "Company" },
  { value: "status", label: "Status" },
]);

export const DEFAULT_APPLICATION_FILTERS = Object.freeze({
  status: ALL_FILTER_VALUE,
  workMode: ALL_FILTER_VALUE,
  employmentType: ALL_FILTER_VALUE,
  source: ALL_FILTER_VALUE,
});

export const EMPTY_APPLICATION_FORM = Object.freeze({
  company: "",
  role: "",
  status: DEFAULT_APPLICATION_STATUS,
  application_date: "",
  job_url: "",
  location: "",
  employment_type: DEFAULT_EMPLOYMENT_TYPE,
  work_mode: DEFAULT_WORK_MODE,
  salary_text: "",
  source: "",
  contact_name: "",
  contact_email: "",
  notes: "",
  next_follow_up_date: "",
});

const SEARCH_FIELDS = ["company", "role", "location", "notes"];
const NULLABLE_FIELDS = [
  "job_url",
  "location",
  "salary_text",
  "source",
  "contact_name",
  "contact_email",
  "notes",
  "next_follow_up_date",
];

export function todayValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function createApplicationForm(application = null) {
  if (!application) {
    return { ...EMPTY_APPLICATION_FORM, application_date: todayValue() };
  }

  return Object.fromEntries(
    Object.keys(EMPTY_APPLICATION_FORM).map((field) => [
      field,
      application[field] ?? EMPTY_APPLICATION_FORM[field],
    ]),
  );
}

export function applicationPayload(values, userId) {
  const payload = {
    user_id: userId,
    company: values.company.trim(),
    role: values.role.trim(),
    status: values.status,
    application_date: values.application_date,
    employment_type: values.employment_type,
    work_mode: values.work_mode,
  };

  for (const field of NULLABLE_FIELDS) {
    const value = values[field]?.trim?.() ?? values[field];
    payload[field] = value || null;
  }

  return payload;
}

export function safeHttpUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function validateApplication(values) {
  const errors = {};
  const company = values.company.trim();
  const role = values.role.trim();
  const jobUrl = values.job_url.trim();
  const contactEmail = values.contact_email.trim();

  if (!company) errors.company = "Enter a company name.";
  else if (company.length > 200) errors.company = "Use 200 characters or fewer.";

  if (!role) errors.role = "Enter a role title.";
  else if (role.length > 200) errors.role = "Use 200 characters or fewer.";

  if (!values.application_date) {
    errors.application_date = "Choose an application date.";
  }

  if (!APPLICATION_STATUS_VALUES.includes(values.status)) {
    errors.status = "Choose a valid status.";
  }

  if (jobUrl && !safeHttpUrl(jobUrl)) {
    errors.job_url = "Enter a complete http or https URL.";
  }

  if (
    contactEmail &&
    (!/^[^\s@]+@[^\s@]+$/.test(contactEmail) || contactEmail.length > 320)
  ) {
    errors.contact_email = "Enter a valid email address.";
  }

  return errors;
}

export function hasApplicationChanges(values, application) {
  const original = createApplicationForm(application);
  return Object.keys(EMPTY_APPLICATION_FORM).some(
    (field) => values[field] !== original[field],
  );
}

export function distinctSources(applications) {
  return [...new Set(
    applications
      .map(({ source }) => source?.trim())
      .filter(Boolean),
  )].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
}

export function replaceApplication(applications, application) {
  return applications.map((item) =>
    item.id === application.id ? application : item,
  );
}

export function applicationWithStatus(application, status, updatedAt) {
  return { ...application, status, updated_at: updatedAt };
}

export function hasActiveFilters(filters, search = "") {
  return (
    search.trim().length > 0 ||
    Object.values(filters).some((value) => value !== ALL_FILTER_VALUE)
  );
}

function compareNullableDates(left, right, direction = "desc") {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  const comparison = left.localeCompare(right);
  return direction === "desc" ? -comparison : comparison;
}

export function filterAndSortApplications(
  applications,
  { search = "", filters = DEFAULT_APPLICATION_FILTERS, sort = "application-date" },
) {
  const query = search.trim().toLocaleLowerCase();
  const filtered = applications.filter((application) => {
    const matchesSearch =
      !query ||
      SEARCH_FIELDS.some((field) =>
        String(application[field] ?? "").toLocaleLowerCase().includes(query),
      );

    return (
      matchesSearch &&
      (filters.status === ALL_FILTER_VALUE ||
        application.status === filters.status) &&
      (filters.workMode === ALL_FILTER_VALUE ||
        application.work_mode === filters.workMode) &&
      (filters.employmentType === ALL_FILTER_VALUE ||
        application.employment_type === filters.employmentType) &&
      (filters.source === ALL_FILTER_VALUE ||
        application.source?.trim() === filters.source)
    );
  });

  return filtered.toSorted((left, right) => {
    if (sort === "recently-updated") {
      return compareNullableDates(left.updated_at, right.updated_at);
    }
    if (sort === "company") {
      return left.company.localeCompare(right.company, undefined, {
        sensitivity: "base",
      });
    }
    if (sort === "status") {
      return (
        APPLICATION_STATUS_VALUES.indexOf(left.status) -
          APPLICATION_STATUS_VALUES.indexOf(right.status) ||
        compareNullableDates(left.application_date, right.application_date)
      );
    }
    return (
      compareNullableDates(left.application_date, right.application_date) ||
      compareNullableDates(left.created_at, right.created_at)
    );
  });
}

export function formatDate(value, fallback = "Not set") {
  if (!value) return fallback;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
