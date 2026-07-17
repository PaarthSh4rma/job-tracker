import { useEffect, useMemo, useRef, useState } from "react";
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
  const transitionReadyRef = useRef(false);
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
    const root = document.documentElement;
    const shouldAnimate = transitionReadyRef.current;
    if (shouldAnimate) root.classList.add("theme-transitioning");
    applyTheme(resolvedTheme);

    if (!shouldAnimate) {
      const frame = window.requestAnimationFrame(() => {
        transitionReadyRef.current = true;
      });
      return () => window.cancelAnimationFrame(frame);
    }

    root.classList.add("theme-transitioning");
    const timeout = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      root.classList.remove("theme-transitioning");
    };
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
