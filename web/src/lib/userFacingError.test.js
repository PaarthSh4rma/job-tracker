import assert from "node:assert/strict";
import test from "node:test";

import { userFacingError } from "./userFacingError.js";

test("user-facing errors are useful without exposing provider details", () => {
  assert.equal(
    userFacingError("load"),
    "Your applications could not be loaded. Check your connection and try again.",
  );
  assert.equal(
    userFacingError("status"),
    "The status could not be updated. The previous status has been restored.",
  );
  assert.equal(userFacingError("unknown"), "Something went wrong. Please try again.");
});

