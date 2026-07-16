import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTH_MODES,
  authSubmitLabel,
  nextAuthMode,
  validateAuthForm,
} from "./authForm.js";

test("auth mode switching is explicit and reversible", () => {
  assert.equal(nextAuthMode(AUTH_MODES.SIGN_IN), AUTH_MODES.SIGN_UP);
  assert.equal(nextAuthMode(AUTH_MODES.SIGN_UP), AUTH_MODES.SIGN_IN);
});

test("auth validation associates useful errors with invalid fields", () => {
  assert.deepEqual(
    validateAuthForm({ email: "not-an-email", password: "short" }, AUTH_MODES.SIGN_UP),
    {
      email: "Enter a valid email address.",
      password: "Use at least 8 characters for your password.",
    },
  );

  assert.deepEqual(
    validateAuthForm({ email: "person@example.com", password: "valid-password" }, AUTH_MODES.SIGN_UP),
    {},
  );
});

test("auth submission labels communicate loading state", () => {
  assert.equal(authSubmitLabel(AUTH_MODES.SIGN_IN, false), "Sign in");
  assert.equal(authSubmitLabel(AUTH_MODES.SIGN_IN, true), "Signing in…");
  assert.equal(authSubmitLabel(AUTH_MODES.SIGN_UP, true), "Creating account…");
});
