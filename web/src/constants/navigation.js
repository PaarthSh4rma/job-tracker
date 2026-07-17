export const APP_VIEWS = Object.freeze([
  {
    id: "overview",
    label: "Overview",
    description: "A clear starting point for your search.",
  },
  {
    id: "applications",
    label: "Applications",
    description: "Your existing application workspace.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Current-status trends and application activity.",
  },
]);

export const DEFAULT_APP_VIEW = "overview";
export const APP_VIEW_STORAGE_KEY = "trackline:selected-view";
export const APP_VIEW_IDS = Object.freeze(APP_VIEWS.map(({ id }) => id));

export function isAppView(value) {
  return APP_VIEW_IDS.includes(value);
}

export function getStoredAppView(storage) {
  try {
    const value = storage?.getItem(APP_VIEW_STORAGE_KEY);
    return isAppView(value) ? value : DEFAULT_APP_VIEW;
  } catch {
    return DEFAULT_APP_VIEW;
  }
}

export function storeAppView(storage, view) {
  if (!isAppView(view)) return false;

  try {
    storage?.setItem(APP_VIEW_STORAGE_KEY, view);
    return true;
  } catch {
    return false;
  }
}
