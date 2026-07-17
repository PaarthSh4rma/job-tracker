export const APPLICATIONS_VIEWS = Object.freeze(["list", "pipeline"]);
export const APPLICATIONS_VIEW_STORAGE_KEY = "trackline:applications-view";

export function getStoredApplicationsView(storage) {
  try {
    const value = storage?.getItem(APPLICATIONS_VIEW_STORAGE_KEY);
    return APPLICATIONS_VIEWS.includes(value) ? value : "list";
  } catch {
    return "list";
  }
}

export function storeApplicationsView(storage, view) {
  if (!APPLICATIONS_VIEWS.includes(view)) return false;
  try {
    storage?.setItem(APPLICATIONS_VIEW_STORAGE_KEY, view);
    return true;
  } catch {
    return false;
  }
}
