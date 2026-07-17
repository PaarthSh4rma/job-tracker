const AUTH_MESSAGES = Object.freeze({
  signIn: "Check your email and password, then try again.",
  signUp: "Your account could not be created. Check your details and try again.",
  session: "Your session could not be restored. Please sign in again.",
});

const APPLICATION_MESSAGES = Object.freeze({
  load: "Your applications could not be loaded. Check your connection and try again.",
  create: "The application could not be added. Your form details are still here.",
  update: "The application could not be saved. Your changes are still here.",
  delete: "The application could not be deleted. Please try again.",
  status: "The status could not be updated. The previous status has been restored.",
  followUp: "The follow-up could not be updated. The previous date has been restored.",
  signOut: "You could not be signed out. Please try again.",
});

export function userFacingError(scope) {
  return AUTH_MESSAGES[scope] ?? APPLICATION_MESSAGES[scope] ??
    "Something went wrong. Please try again.";
}

