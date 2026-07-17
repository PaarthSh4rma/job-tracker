import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyFollowUps,
  computeAnalytics,
  groupApplicationsByPipeline,
  groupApplicationsByWeek,
  mondayWeekStart,
} from "./analyticsModel.js";

const application = (id, status, extra = {}) => ({
  id,
  company: `Company ${id}`,
  role: "Software Engineer",
  status,
  application_date: "2026-07-13",
  created_at: `2026-07-${String(id).padStart(2, "0")}T00:00:00Z`,
  source: "Referral",
  work_mode: "remote",
  employment_type: "full-time",
  ...extra,
});

test("active and closed applications use the centralized current-status contract", () => {
  const analytics = computeAnalytics([
    application(1, "saved"),
    application(2, "applied"),
    application(3, "offer"),
    application(4, "rejected"),
    application(5, "withdrawn"),
  ]);
  assert.equal(analytics.active, 3);
  assert.equal(analytics.closed, 2);
});

test("response and conversion rates use reached-applied denominator", () => {
  const analytics = computeAnalytics([
    application(1, "saved"),
    application(2, "applied"),
    application(3, "screening"),
    application(4, "interview"),
    application(5, "offer"),
    application(6, "rejected"),
  ]);
  assert.equal(analytics.responseRate, 4 / 5);
  assert.equal(analytics.interviewConversionRate, 2 / 5);
  assert.equal(analytics.offerConversionRate, 1 / 5);
});

test("rates are unavailable for a zero reached-applied denominator", () => {
  const analytics = computeAnalytics([application(1, "saved")]);
  assert.equal(analytics.responseRate, null);
  assert.equal(analytics.interviewConversionRate, null);
  assert.equal(analytics.offerConversionRate, null);
});

test("weekly grouping starts Monday, sorts chronologically, and excludes null dates", () => {
  assert.equal(mondayWeekStart("2026-07-13"), "2026-07-13");
  assert.equal(mondayWeekStart("2026-07-19"), "2026-07-13");
  const result = groupApplicationsByWeek([
    application(1, "applied", { application_date: "2026-07-19" }),
    application(2, "applied", { application_date: "2026-07-06" }),
    application(3, "applied", { application_date: null }),
  ]);
  assert.deepEqual(result.weeks, [
    { weekStart: "2026-07-06", count: 1 },
    { weekStart: "2026-07-13", count: 1 },
  ]);
  assert.equal(result.excludedWithoutDate, 1);
});

test("follow-ups classify date-only values using the supplied local calendar day", () => {
  const now = new Date("2026-07-18T00:30:00+10:00");
  const result = classifyFollowUps([
    application(1, "applied", { next_follow_up_date: "2026-07-17" }),
    application(2, "interview", { next_follow_up_date: "2026-07-18" }),
    application(3, "offer", { next_follow_up_date: "2026-07-19" }),
    application(4, "applied", { next_follow_up_date: null }),
    application(5, "rejected", { next_follow_up_date: "2026-07-17" }),
  ], now, -600);
  assert.deepEqual(result.overdue.map(({ id }) => id), [1]);
  assert.deepEqual(result.dueToday.map(({ id }) => id), [2]);
  assert.deepEqual(result.upcoming.map(({ id }) => id), [3]);
  assert.deepEqual(result.unscheduled.map(({ id }) => id), [4]);
});

test("source and role aggregation are case-insensitive", () => {
  const analytics = computeAnalytics([
    application(1, "applied", { source: "Referral", role: "Engineer" }),
    application(2, "applied", { source: "referral", role: "engineer" }),
    application(3, "applied", { source: "LinkedIn", role: "Designer" }),
  ]);
  assert.deepEqual(analytics.sourceDistribution.slice(0, 2), [
    { label: "Referral", count: 2 },
    { label: "LinkedIn", count: 1 },
  ]);
  assert.deepEqual(analytics.commonRoles.slice(0, 2), [
    { label: "Engineer", count: 2 },
    { label: "Designer", count: 1 },
  ]);
});

test("pipeline grouping includes every current status without double counting", () => {
  const applications = [
    application(1, "applied"),
    application(2, "interview"),
    application(3, "interview"),
  ];
  const pipeline = groupApplicationsByPipeline(applications);
  assert.equal(pipeline.applied.length, 1);
  assert.equal(pipeline.interview.length, 2);
  assert.equal(
    Object.values(pipeline).reduce((sum, items) => sum + items.length, 0),
    applications.length,
  );
});
