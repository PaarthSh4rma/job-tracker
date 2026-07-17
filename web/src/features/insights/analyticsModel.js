import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "../../constants/application.js";
import { todayValue } from "../applications/applicationModel.js";

export const ACTIVE_STATUSES = Object.freeze([
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
]);
export const CLOSED_STATUSES = Object.freeze(["rejected", "withdrawn"]);
export const RESPONSE_STATUSES = Object.freeze([
  "screening",
  "interview",
  "offer",
  "rejected",
]);
export const INTERVIEW_OR_BEYOND_STATUSES = Object.freeze([
  "interview",
  "offer",
]);

function ratio(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator;
}

export function formatRate(value) {
  return value === null ? "Unavailable" : `${Math.round(value * 100)}%`;
}

export function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function formatUtcDate(date) {
  return date.toISOString().slice(0, 10);
}

export function mondayWeekStart(value) {
  if (!isValidDateOnly(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return formatUtcDate(date);
}

export function groupApplicationsByWeek(applications) {
  const counts = new Map();
  let excludedWithoutDate = 0;

  for (const application of applications) {
    const weekStart = mondayWeekStart(application.application_date);
    if (!weekStart) {
      excludedWithoutDate += 1;
      continue;
    }
    counts.set(weekStart, (counts.get(weekStart) ?? 0) + 1);
  }

  return {
    weeks: [...counts.entries()]
      .map(([weekStart, count]) => ({ weekStart, count }))
      .sort((left, right) => left.weekStart.localeCompare(right.weekStart)),
    excludedWithoutDate,
  };
}

export function recentWeeklyActivity(
  applications,
  weeks = 10,
  now = new Date(),
  timezoneOffsetMinutes = now.getTimezoneOffset(),
) {
  const { weeks: grouped, excludedWithoutDate } =
    groupApplicationsByWeek(applications);
  const counts = new Map(grouped.map(({ weekStart, count }) => [weekStart, count]));
  const currentWeek = mondayWeekStart(todayValue(now, timezoneOffsetMinutes));
  const current = new Date(`${currentWeek}T00:00:00Z`);
  const recent = [];

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const week = new Date(current);
    week.setUTCDate(week.getUTCDate() - offset * 7);
    const weekStart = formatUtcDate(week);
    recent.push({ weekStart, count: counts.get(weekStart) ?? 0 });
  }

  return { weeks: recent, excludedWithoutDate };
}

export function aggregateTextField(applications, field) {
  const entries = new Map();
  for (const application of applications) {
    const label = application[field]?.trim();
    if (!label) continue;
    const key = label.toLocaleLowerCase();
    const current = entries.get(key);
    entries.set(key, {
      label: current?.label ?? label,
      count: (current?.count ?? 0) + 1,
    });
  }
  return [...entries.values()].sort(
    (left, right) =>
      right.count - left.count ||
      left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
  );
}

export function distributionForOptions(applications, field, options) {
  const counts = new Map(options.map(({ value }) => [value, 0]));
  for (const application of applications) {
    if (counts.has(application[field])) {
      counts.set(application[field], counts.get(application[field]) + 1);
    }
  }
  return options.map(({ value, label }) => ({
    value,
    label,
    count: counts.get(value),
  }));
}

export function groupApplicationsByPipeline(applications) {
  const groups = Object.fromEntries(
    APPLICATION_STATUSES.map(({ value }) => [value, []]),
  );
  for (const application of applications) {
    if (groups[application.status]) groups[application.status].push(application);
  }
  for (const status of Object.keys(groups)) {
    groups[status] = groups[status].toSorted((left, right) =>
      (right.application_date ?? "").localeCompare(left.application_date ?? ""),
    );
  }
  return groups;
}

export function classifyFollowUps(
  applications,
  now = new Date(),
  timezoneOffsetMinutes = now.getTimezoneOffset(),
) {
  const today = todayValue(now, timezoneOffsetMinutes);
  const categories = {
    overdue: [],
    dueToday: [],
    upcoming: [],
    unscheduled: [],
  };

  // Closed applications are excluded because they no longer need action.
  for (const application of applications.filter(({ status }) =>
    ACTIVE_STATUSES.includes(status),
  )) {
    const followUp = application.next_follow_up_date;
    if (!isValidDateOnly(followUp)) categories.unscheduled.push(application);
    else if (followUp < today) categories.overdue.push(application);
    else if (followUp === today) categories.dueToday.push(application);
    else categories.upcoming.push(application);
  }

  const byDate = (left, right) =>
    left.next_follow_up_date.localeCompare(right.next_follow_up_date);
  categories.overdue.sort(byDate);
  categories.dueToday.sort(byDate);
  categories.upcoming.sort(byDate);
  return categories;
}

export function computeAnalytics(
  applications,
  now = new Date(),
  timezoneOffsetMinutes = now.getTimezoneOffset(),
) {
  const countStatus = (statuses) =>
    applications.filter(({ status }) => statuses.includes(status)).length;
  const reachedApplied = applications.filter(({ status }) => status !== "saved");
  const responses = countStatus(RESPONSE_STATUSES);
  const interviews = countStatus(INTERVIEW_OR_BEYOND_STATUSES);
  const offers = countStatus(["offer"]);
  const weekly = groupApplicationsByWeek(applications);

  // Conversion metrics use current stored status only. Without status history,
  // they describe the present pipeline rather than a true historical funnel.
  return {
    total: applications.length,
    active: countStatus(ACTIVE_STATUSES),
    closed: countStatus(CLOSED_STATUSES),
    responses,
    interviews,
    offers,
    rejections: countStatus(["rejected"]),
    withdrawn: countStatus(["withdrawn"]),
    responseRate: ratio(responses, reachedApplied.length),
    interviewConversionRate: ratio(interviews, reachedApplied.length),
    offerConversionRate: ratio(offers, reachedApplied.length),
    averageApplicationsPerActiveWeek: ratio(
      weekly.weeks.reduce((sum, week) => sum + week.count, 0),
      weekly.weeks.length,
    ),
    statusDistribution: distributionForOptions(
      applications,
      "status",
      APPLICATION_STATUSES,
    ),
    sourceDistribution: aggregateTextField(applications, "source"),
    commonRoles: aggregateTextField(applications, "role"),
    workModeDistribution: distributionForOptions(
      applications,
      "work_mode",
      WORK_MODES,
    ),
    employmentTypeDistribution: distributionForOptions(
      applications,
      "employment_type",
      EMPLOYMENT_TYPES,
    ),
    weeklyActivity: weekly,
    recentWeeklyActivity: recentWeeklyActivity(
      applications,
      10,
      now,
      timezoneOffsetMinutes,
    ),
    recentApplications: applications
      .toSorted((left, right) =>
        (right.created_at ?? "").localeCompare(left.created_at ?? ""),
      )
      .slice(0, 5),
    followUps: classifyFollowUps(applications, now, timezoneOffsetMinutes),
  };
}
