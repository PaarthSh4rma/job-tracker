export const AUTH_MODES = Object.freeze({
  SIGN_IN: "sign-in",
  SIGN_UP: "sign-up",
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function nextAuthMode(mode) {
  return mode === AUTH_MODES.SIGN_IN
    ? AUTH_MODES.SIGN_UP
    : AUTH_MODES.SIGN_IN;
}

export function validateAuthForm({ email, password }, mode) {
  const errors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  } else if (mode === AUTH_MODES.SIGN_UP && password.length < 8) {
    errors.password = "Use at least 8 characters for your password.";
  }

  return errors;
}

export function authSubmitLabel(mode, submitting) {
  if (submitting) {
    return mode === AUTH_MODES.SIGN_IN ? "Signing in…" : "Creating account…";
  }
  return mode === AUTH_MODES.SIGN_IN ? "Sign in" : "Create account";
}
