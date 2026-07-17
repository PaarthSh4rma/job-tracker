import assert from "node:assert/strict";
import test from "node:test";

import {
  ALL_FILTER_VALUE,
  DEFAULT_APPLICATION_FILTERS,
  addApplicationToCollection,
  filterAndSortApplications,
  hasApplicationChanges,
  applicationWithStatus,
  replaceApplication,
  removeApplicationFromCollection,
  restoreApplicationFields,
  safeHttpUrl,
  validateApplication,
} from "./applicationModel.js";

const applications = [
  {
    id: 1,
    company: "Beta Labs",
    role: "Designer",
    location: "Melbourne",
    notes: "Portfolio review",
    status: "interview",
    work_mode: "hybrid",
    employment_type: "full-time",
    source: "Referral",
    application_date: "2026-07-10",
    updated_at: "2026-07-11T10:00:00Z",
    created_at: "2026-07-10T10:00:00Z",
  },
  {
    id: 2,
    company: "Alpha Co",
    role: "Engineer",
    location: null,
    notes: null,
    status: "applied",
    work_mode: "remote",
    employment_type: "graduate",
    source: "LinkedIn",
    application_date: null,
    updated_at: "2026-07-12T10:00:00Z",
    created_at: "2026-07-12T10:00:00Z",
  },
];

test("search matches company, role, location, and notes case-insensitively", () => {
  for (const query of ["BETA", "designer", "melbourne", "portfolio"]) {
    assert.deepEqual(
      filterAndSortApplications(applications, {
        search: query,
        filters: DEFAULT_APPLICATION_FILTERS,
        sort: "application-date",
      }).map(({ id }) => id),
      [1],
    );
  }
});

test("filters combine status, work mode, employment type, and source", () => {
  assert.deepEqual(
    filterAndSortApplications(applications, {
      search: "",
      filters: {
        status: "applied",
        workMode: "remote",
        employmentType: "graduate",
        source: "LinkedIn",
      },
      sort: "application-date",
    }).map(({ id }) => id),
    [2],
  );

  assert.equal(
    filterAndSortApplications(applications, {
      search: "",
      filters: {
        status: "offer",
        workMode: ALL_FILTER_VALUE,
        employmentType: ALL_FILTER_VALUE,
        source: ALL_FILTER_VALUE,
      },
      sort: "application-date",
    }).length,
    0,
  );
});

test("sorting supports application date, updated date, company, and status", () => {
  assert.deepEqual(
    filterAndSortApplications(applications, {
      filters: DEFAULT_APPLICATION_FILTERS,
      sort: "application-date",
    }).map(({ id }) => id),
    [1, 2],
    "null application dates sort last",
  );
  assert.deepEqual(
    filterAndSortApplications(applications, {
      filters: DEFAULT_APPLICATION_FILTERS,
      sort: "recently-updated",
    }).map(({ id }) => id),
    [2, 1],
  );
  assert.deepEqual(
    filterAndSortApplications(applications, {
      filters: DEFAULT_APPLICATION_FILTERS,
      sort: "company",
    }).map(({ id }) => id),
    [2, 1],
  );
  assert.deepEqual(
    filterAndSortApplications(applications, {
      filters: DEFAULT_APPLICATION_FILTERS,
      sort: "status",
    }).map(({ id }) => id),
    [2, 1],
  );
});

test("validation covers required fields, URLs, and contact email", () => {
  const errors = validateApplication({
    company: "",
    role: "",
    application_date: "",
    status: "invalid",
    job_url: "javascript:alert(1)",
    contact_email: "not-an-email",
  });

  assert.deepEqual(Object.keys(errors).sort(), [
    "application_date",
    "company",
    "contact_email",
    "job_url",
    "role",
    "status",
  ]);
});

test("only http and https job links are considered safe", () => {
  assert.equal(
    safeHttpUrl("https://example.com/jobs/123"),
    "https://example.com/jobs/123",
  );
  assert.equal(safeHttpUrl("javascript:alert(1)"), null);
  assert.equal(safeHttpUrl("not-a-url"), null);
});

test("optimistic status changes can be replaced or rolled back by id", () => {
  const original = applications[0];
  const optimistic = applicationWithStatus(
    original,
    "offer",
    "2026-07-13T10:00:00Z",
  );
  const optimisticList = replaceApplication(applications, optimistic);

  assert.equal(optimisticList[0].status, "offer");
  assert.equal(replaceApplication(optimisticList, original)[0], original);
  assert.equal(optimisticList[1], applications[1]);
});

test("optimistic rollback restores only failed fields and preserves newer data", () => {
  const current = [
    {
      ...applications[0],
      status: "offer",
      notes: "Saved while the status request was pending",
    },
  ];
  const rolledBack = restoreApplicationFields(current, applications[0].id, {
    status: applications[0].status,
    updated_at: applications[0].updated_at,
  });

  assert.equal(rolledBack[0].status, "interview");
  assert.equal(rolledBack[0].notes, "Saved while the status request was pending");
});

test("shared application collections stay synchronized after create, edit, and delete", () => {
  const created = { ...applications[0], id: 3, company: "Gamma Group" };
  const afterCreate = addApplicationToCollection(applications, created);
  assert.deepEqual(afterCreate.map(({ id }) => id), [3, 1, 2]);

  const edited = { ...created, role: "Senior Designer" };
  const afterEdit = replaceApplication(afterCreate, edited);
  assert.equal(afterEdit[0].role, "Senior Designer");

  const afterDelete = removeApplicationFromCollection(afterEdit, created.id);
  assert.deepEqual(afterDelete, applications);
});

test("dirty-state detection compares every editable field", () => {
  const application = {
    company: "Alpha",
    role: "Engineer",
    status: "applied",
    application_date: "2026-07-10",
    work_mode: "remote",
    employment_type: "full-time",
  };
  const unchanged = {
    company: "Alpha",
    role: "Engineer",
    status: "applied",
    application_date: "2026-07-10",
    job_url: "",
    location: "",
    employment_type: "full-time",
    work_mode: "remote",
    salary_text: "",
    source: "",
    contact_name: "",
    contact_email: "",
    notes: "",
    next_follow_up_date: "",
  };

  assert.equal(hasApplicationChanges(unchanged, application), false);
  assert.equal(
    hasApplicationChanges({ ...unchanged, notes: "Follow up next week" }, application),
    true,
  );
});
