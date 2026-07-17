import assert from "node:assert/strict";
import test from "node:test";

import { applicationShortcut, isEditableTarget } from "./keyboardShortcuts.js";

const target = (tagName, isContentEditable = false) => ({ tagName, isContentEditable });
const event = (key, overrides = {}) => ({
  key,
  target: target("DIV"),
  defaultPrevented: false,
  repeat: false,
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  ...overrides,
});

test("shortcut guards recognise editable controls", () => {
  assert.equal(isEditableTarget(target("INPUT")), true);
  assert.equal(isEditableTarget(target("textarea")), true);
  assert.equal(isEditableTarget(target("select")), true);
  assert.equal(isEditableTarget(target("DIV", true)), true);
  assert.equal(isEditableTarget(target("BUTTON")), false);
});

test("application shortcuts focus search and open create", () => {
  assert.equal(applicationShortcut(event("/")), "search");
  assert.equal(applicationShortcut(event("n")), "create");
  assert.equal(applicationShortcut(event("N")), "create");
});

test("shortcuts ignore forms, modifiers, repeats, and open overlays", () => {
  assert.equal(applicationShortcut(event("/", { target: target("INPUT") })), null);
  assert.equal(applicationShortcut(event("n", { metaKey: true })), null);
  assert.equal(applicationShortcut(event("n", { repeat: true })), null);
  assert.equal(applicationShortcut(event("n"), true), null);
});

