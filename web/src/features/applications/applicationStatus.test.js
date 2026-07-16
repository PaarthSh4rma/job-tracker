import assert from "node:assert/strict";
import test from "node:test";

import { APPLICATION_STATUS_VALUES } from "../../constants/application.js";
import { applicationStatusPresentation } from "./applicationStatus.js";

test("every supported status has a readable badge presentation", () => {
  for (const status of APPLICATION_STATUS_VALUES) {
    const presentation = applicationStatusPresentation(status);
    assert.ok(presentation.label.length > 0);
    assert.match(presentation.className, /bg-/);
    assert.match(presentation.className, /text-/);
  }
});
