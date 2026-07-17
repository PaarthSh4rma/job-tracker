import { useEffect, useMemo, useState } from "react";
import { AppearanceContext } from "./appearanceContext";
import {
  getStoredTheme,
  isThemePreference,
  resolveTheme,
  storeTheme,
} from "./theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function applyTheme(resolvedTheme) {
  const dark = resolvedTheme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = resolvedTheme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", dark ? "#0f1713" : "#f6f8f7");
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() =>
    getStoredTheme(globalThis.localStorage),
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    globalThis.matchMedia?.(DARK_QUERY).matches ?? false,
  );
  const resolvedTheme = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    const media = globalThis.matchMedia?.(DARK_QUERY);
    if (!media) return undefined;

    const handleChange = (event) => setSystemPrefersDark(event.matches);
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const selectTheme = (nextPreference) => {
    if (!isThemePreference(nextPreference)) return;
    setPreference(nextPreference);
    storeTheme(globalThis.localStorage, nextPreference);
  };

  const value = useMemo(
    () => ({ preference, resolvedTheme, selectTheme }),
    [preference, resolvedTheme],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}
