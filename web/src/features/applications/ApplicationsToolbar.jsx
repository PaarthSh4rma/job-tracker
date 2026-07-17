import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "../../constants/application";
import { Button, Select } from "../../components/ui";
import { NavigationIcon } from "../../components/layout/NavigationIcon";
import {
  ALL_FILTER_VALUE,
  APPLICATION_SORTS,
  hasActiveFilters,
} from "./applicationModel";

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <Select
      id={id}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-w-40 flex-1"
    >
      <option value={ALL_FILTER_VALUE}>All</option>
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </option>
      ))}
    </Select>
  );
}

export function ApplicationsToolbar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  sort,
  onSortChange,
  sources,
  onClear,
  onAdd,
  searchInputRef,
  addButtonRef,
}) {
  const clearDisabled = !hasActiveFilters(filters, search);
  const sourceOptions =
    filters.source !== ALL_FILTER_VALUE && !sources.includes(filters.source)
      ? [...sources, filters.source].sort((left, right) =>
          left.localeCompare(right, undefined, { sensitivity: "base" }),
        )
      : sources;

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="applications-search" className="sr-only">
            Search applications
          </label>
          <NavigationIcon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint"
          />
          <input
            ref={searchInputRef}
            data-focus-fallback
            id="applications-search"
            type="search"
            value={search}
            placeholder="Search company, role, location, or notes…"
            className="min-h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-12 text-[15px] text-ink shadow-control outline-none transition-colors placeholder:text-faint focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15"
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-subtle px-1.5 py-0.5 text-xs font-medium text-faint sm:block" aria-hidden="true">
            /
          </kbd>
        </div>
        <Button ref={addButtonRef} className="shrink-0 lg:px-5" onClick={onAdd}>
          <NavigationIcon name="plus" />
          Add application
          <kbd className="hidden rounded border border-white/40 px-1 text-[10px] font-semibold opacity-80 sm:inline" aria-hidden="true">
            N
          </kbd>
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          id="status-filter"
          label="Status"
          value={filters.status}
          options={APPLICATION_STATUSES}
          onChange={(value) => onFilterChange("status", value)}
        />
        <FilterSelect
          id="work-mode-filter"
          label="Work mode"
          value={filters.workMode}
          options={WORK_MODES}
          onChange={(value) => onFilterChange("workMode", value)}
        />
        <FilterSelect
          id="employment-type-filter"
          label="Employment type"
          value={filters.employmentType}
          options={EMPLOYMENT_TYPES}
          onChange={(value) => onFilterChange("employmentType", value)}
        />
        {sourceOptions.length > 0 && (
          <FilterSelect
            id="source-filter"
            label="Source"
            value={filters.source}
            options={sourceOptions}
            onChange={(value) => onFilterChange("source", value)}
          />
        )}
        <Select
          id="applications-sort"
          label="Sort"
          value={sort}
          className="min-w-44 flex-1"
          onChange={(event) => onSortChange(event.target.value)}
        >
          {APPLICATION_SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          className="shrink-0"
          disabled={clearDisabled}
          onClick={onClear}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
