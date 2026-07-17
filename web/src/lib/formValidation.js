export function firstInvalidFieldId(formId, errors) {
  const firstField = Object.keys(errors).find((field) => errors[field]);
  return firstField ? `${formId}-${firstField.replaceAll("_", "-")}` : null;
}

