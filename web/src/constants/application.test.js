import assert from "node:assert/strict";
import test from "node:test";

import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_VALUES,
  DEFAULT_APPLICATION_STATUS,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "./application.js";

test("application status values are unique and include the default", () => {
  assert.equal(
    new Set(APPLICATION_STATUS_VALUES).size,
    APPLICATION_STATUS_VALUES.length,
  );
  assert.ok(APPLICATION_STATUS_VALUES.includes(DEFAULT_APPLICATION_STATUS));
});

test("select contracts expose non-empty values and labels", () => {
  for (const option of [
    ...APPLICATION_STATUSES,
    ...WORK_MODES,
    ...EMPLOYMENT_TYPES,
  ]) {
    assert.ok(option.value.length > 0);
    assert.ok(option.label.length > 0);
  }
});

