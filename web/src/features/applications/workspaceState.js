export const INITIAL_WORKSPACE_STATE = Object.freeze({
  panel: null,
  applicationId: null,
  deleteConfirmationOpen: false,
});

export function workspaceReducer(state, action) {
  switch (action.type) {
    case "open-create":
      return { panel: "create", applicationId: null, deleteConfirmationOpen: false };
    case "open-details":
      return {
        panel: "details",
        applicationId: action.applicationId,
        deleteConfirmationOpen: false,
      };
    case "open-edit":
      return { ...state, panel: "edit", deleteConfirmationOpen: false };
    case "close-panel":
      return INITIAL_WORKSPACE_STATE;
    case "request-delete":
      return { ...state, deleteConfirmationOpen: true };
    case "cancel-delete":
      return { ...state, deleteConfirmationOpen: false };
    default:
      return state;
  }
}
