import assert from "node:assert/strict";
import test from "node:test";

import {
  INITIAL_WORKSPACE_STATE,
  workspaceReducer,
} from "./workspaceState.js";

test("application drawer opens for details and closes cleanly", () => {
  const open = workspaceReducer(INITIAL_WORKSPACE_STATE, {
    type: "open-details",
    applicationId: 42,
  });
  assert.deepEqual(open, {
    panel: "details",
    applicationId: 42,
    deleteConfirmationOpen: false,
  });
  assert.equal(workspaceReducer(open, { type: "close-panel" }), INITIAL_WORKSPACE_STATE);
});

test("delete confirmation opens and cancels without losing drawer context", () => {
  const details = {
    panel: "details",
    applicationId: 42,
    deleteConfirmationOpen: false,
  };
  const confirmation = workspaceReducer(details, { type: "request-delete" });
  assert.equal(confirmation.deleteConfirmationOpen, true);
  assert.deepEqual(
    workspaceReducer(confirmation, { type: "cancel-delete" }),
    details,
  );
});
