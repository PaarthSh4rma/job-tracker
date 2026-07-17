import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  getStoredTheme,
  isThemePreference,
  resolveTheme,
  storeTheme,
} from "./theme.js";

function storage(initialValue = null, shouldThrow = false) {
  let value = initialValue;
  return {
    getItem(key) {
      if (shouldThrow) throw new Error("Storage unavailable");
      assert.equal(key, THEME_STORAGE_KEY);
      return value;
    },
    setItem(key, nextValue) {
      if (shouldThrow) throw new Error("Storage unavailable");
      assert.equal(key, THEME_STORAGE_KEY);
      value = nextValue;
    },
    value: () => value,
  };
}

test("theme preferences resolve light, dark, and system choices", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
});

test("stored theme selection is validated and persisted safely", () => {
  const valid = storage("dark");
  assert.equal(getStoredTheme(valid), "dark");
  assert.equal(storeTheme(valid, "light"), true);
  assert.equal(valid.value(), "light");

  assert.equal(getStoredTheme(storage("sepia")), DEFAULT_THEME);
  assert.equal(getStoredTheme(storage(null, true)), DEFAULT_THEME);
  assert.equal(storeTheme(storage(null, true), "dark"), false);
  assert.equal(storeTheme(valid, "sepia"), false);
});

test("appearance control exposes only supported states", () => {
  assert.equal(isThemePreference("light"), true);
  assert.equal(isThemePreference("dark"), true);
  assert.equal(isThemePreference("system"), true);
  assert.equal(isThemePreference("auto"), false);
});

