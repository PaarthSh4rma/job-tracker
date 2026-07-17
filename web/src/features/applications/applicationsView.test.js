import assert from "node:assert/strict";
import test from "node:test";

import {
  APPLICATIONS_VIEW_STORAGE_KEY,
  getStoredApplicationsView,
  storeApplicationsView,
} from "./applicationsView.js";

function storage(initial = null) {
  let value = initial;
  return {
    getItem(key) {
      return key === APPLICATIONS_VIEW_STORAGE_KEY ? value : null;
    },
    setItem(key, next) {
      if (key === APPLICATIONS_VIEW_STORAGE_KEY) value = next;
    },
  };
}

test("applications view persists list or pipeline for the current session", () => {
  const session = storage();
  assert.equal(getStoredApplicationsView(session), "list");
  assert.equal(storeApplicationsView(session, "pipeline"), true);
  assert.equal(getStoredApplicationsView(session), "pipeline");
  assert.equal(storeApplicationsView(session, "board"), false);
  assert.equal(getStoredApplicationsView(session), "pipeline");
});
