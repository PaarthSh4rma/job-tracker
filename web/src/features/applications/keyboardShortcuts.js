export function isEditableTarget(target) {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  return (
    ["input", "textarea", "select"].includes(tagName) ||
    target.isContentEditable === true
  );
}

export function applicationShortcut(event, overlayOpen = false) {
  if (
    overlayOpen ||
    event.defaultPrevented ||
    event.repeat ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    isEditableTarget(event.target)
  ) {
    return null;
  }

  if (event.key === "/") return "search";
  if (event.key?.toLowerCase() === "n") return "create";
  return null;
}

