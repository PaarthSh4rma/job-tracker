import assert from "node:assert/strict";
import test from "node:test";

import { firstInvalidFieldId } from "./formValidation.js";

test("validation focus targets the first actionable invalid field", () => {
  assert.equal(
    firstInvalidFieldId("create-application", {
      company: "Enter a company name.",
      role: "Enter a role title.",
    }),
    "create-application-company",
  );
  assert.equal(
    firstInvalidFieldId("edit-application", {
      company: undefined,
      contact_email: "Enter a valid email address.",
    }),
    "edit-application-contact-email",
  );
  assert.equal(firstInvalidFieldId("auth", {}), null);
});

