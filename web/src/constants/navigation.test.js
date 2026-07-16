import assert from "node:assert/strict";
import test from "node:test";

import {
  APP_VIEW_STORAGE_KEY,
  APP_VIEWS,
  DEFAULT_APP_VIEW,
  getStoredAppView,
  isAppView,
  storeAppView,
} from "./navigation.js";

function createStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem(key) {
      return key === APP_VIEW_STORAGE_KEY ? value : null;
    },
    setItem(key, nextValue) {
      if (key === APP_VIEW_STORAGE_KEY) value = nextValue;
    },
  };
}

test("shell navigation exposes exactly the three Milestone 3 views", () => {
  assert.deepEqual(
    APP_VIEWS.map(({ id }) => id),
    ["overview", "applications", "analytics"],
  );
});

test("shell navigation restores a valid selection and rejects stale values", () => {
  assert.equal(getStoredAppView(createStorage("applications")), "applications");
  assert.equal(getStoredAppView(createStorage("reports")), DEFAULT_APP_VIEW);
  assert.equal(isAppView("analytics"), true);
  assert.equal(isAppView("settings"), false);
});

test("shell navigation persists only supported views", () => {
  const storage = createStorage();
  assert.equal(storeAppView(storage, "analytics"), true);
  assert.equal(getStoredAppView(storage), "analytics");
  assert.equal(storeAppView(storage, "settings"), false);
  assert.equal(getStoredAppView(storage), "analytics");
});
