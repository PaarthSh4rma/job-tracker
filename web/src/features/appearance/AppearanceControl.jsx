import { useId } from "react";
import { NavigationIcon } from "../../components/layout/NavigationIcon";
import { Select } from "../../components/ui";
import { useAppearance } from "./appearanceContext";
import { THEME_OPTIONS } from "./theme";

export function AppearanceControl({ compact = false }) {
  const { preference, resolvedTheme, selectTheme } = useAppearance();
  const id = useId();

  return (
    <div className={compact ? "w-28 shrink-0 sm:w-36" : undefined}>
      <Select
        id={`appearance-${id}`}
        label="Appearance"
        value={preference}
        className="min-w-0"
        selectClassName={compact ? "text-sm" : undefined}
        aria-label={`Appearance: ${preference}. Current theme: ${resolvedTheme}.`}
        onChange={(event) => selectTheme(event.target.value)}
      >
        {THEME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {!compact && (
        <p className="mt-2 flex items-center gap-2 px-1 text-xs text-faint">
          <NavigationIcon name={resolvedTheme === "dark" ? "moon" : "sun"} className="size-4" />
          {preference === "system"
            ? `Following system (${resolvedTheme})`
            : `${resolvedTheme[0].toUpperCase()}${resolvedTheme.slice(1)} theme`}
        </p>
      )}
    </div>
  );
}
