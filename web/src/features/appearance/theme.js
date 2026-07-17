export const THEME_OPTIONS = Object.freeze([
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]);

export const DEFAULT_THEME = "system";
export const THEME_STORAGE_KEY = "trackline:appearance";

export function isThemePreference(value) {
  return THEME_OPTIONS.some(({ value: option }) => option === value);
}

export function resolveTheme(preference, systemPrefersDark) {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

export function getStoredTheme(storage) {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function storeTheme(storage, preference) {
  if (!isThemePreference(preference)) return false;

  try {
    storage?.setItem(THEME_STORAGE_KEY, preference);
    return true;
  } catch {
    return false;
  }
}

