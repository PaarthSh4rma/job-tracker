import { useState } from "react";
import { PRODUCT } from "../../config/product";
import { Alert, Button, Card, Input, PasswordInput } from "../../components/ui";
import { Brand, BrandMark } from "../../components/layout/Brand";
import { NavigationIcon } from "../../components/layout/NavigationIcon";
import { supabase } from "../../supabaseClient";
import {
  AUTH_MODES,
  authSubmitLabel,
  nextAuthMode,
  validateAuthForm,
} from "./authForm";

const PRODUCT_POINTS = [
  "Keep every opportunity in one dependable workspace.",
  "Move through your search with less mental overhead.",
  "Your records stay private to your authenticated account.",
];

export function AuthScreen({ initialFeedback = null }) {
  const [mode, setMode] = useState(AUTH_MODES.SIGN_IN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    setPassword("");
  };

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    setPassword("");

    if (!data.session) {
      setFeedback({
        type: "success",
        title: "Confirm your email",
        message:
          "We sent a confirmation link to your inbox. Confirm your address, then return here to sign in.",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateAuthForm({ email, password }, mode);
    setErrors(validationErrors);
    setFeedback(null);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (mode === AUTH_MODES.SIGN_IN) await signIn();
      else await signUp();
    } catch (error) {
      setFeedback({
        type: "error",
        title: mode === AUTH_MODES.SIGN_IN ? "Unable to sign in" : "Unable to create account",
        message: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((current) => nextAuthMode(current));
    setPassword("");
    setErrors({});
    setFeedback(null);
  };

  const isSignIn = mode === AUTH_MODES.SIGN_IN;

  return (
    <main className="min-h-screen bg-canvas px-4 py-5 sm:px-6 sm:py-8 lg:flex lg:items-center lg:justify-center lg:p-10">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-line bg-surface shadow-panel lg:grid lg:min-h-[680px] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="flex min-h-full flex-col px-5 py-6 sm:px-10 sm:py-9 lg:px-14 lg:py-12">
          <Brand />

          <div className="mx-auto my-auto w-full max-w-md py-12 lg:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              {isSignIn ? "Welcome back" : "Start your workspace"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {isSignIn ? "Sign in to Trackline" : "Create your account"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
              {isSignIn
                ? "Pick up where you left off and keep your opportunities moving."
                : "Build a private, focused home for your job search."}
            </p>

            <div
              className="mt-7 grid grid-cols-2 rounded-xl bg-subtle p-1"
              role="group"
              aria-label="Authentication mode"
            >
              {[AUTH_MODES.SIGN_IN, AUTH_MODES.SIGN_UP].map((authMode) => {
                const active = mode === authMode;
                const label = authMode === AUTH_MODES.SIGN_IN ? "Sign in" : "Create account";
                return (
                  <button
                    key={authMode}
                    type="button"
                    aria-pressed={active}
                    disabled={submitting}
                    className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      active
                        ? "bg-surface text-ink shadow-control"
                        : "text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                    }`}
                    onClick={() => {
                      if (!active) switchMode();
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
              {feedback && (
                <Alert tone={feedback.type} title={feedback.title}>
                  {feedback.message}
                </Alert>
              )}

              <Input
                id="auth-email"
                label="Email address"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                error={errors.email}
                disabled={submitting}
                required
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                }}
              />
              <PasswordInput
                key={mode}
                id="auth-password"
                label="Password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                placeholder={isSignIn ? "Enter your password" : "At least 8 characters"}
                value={password}
                error={errors.password}
                disabled={submitting}
                required
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
                }}
              />

              <Button type="submit" size="lg" className="w-full" loading={submitting}>
                {authSubmitLabel(mode, submitting)}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {isSignIn ? "New to Trackline?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                onClick={switchMode}
                disabled={submitting}
              >
                {isSignIn ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-faint lg:text-left">
            Your application records are protected by account-level access controls.
          </p>
        </section>

        <aside className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 auth-grid opacity-30" aria-hidden="true" />
          <div className="relative">
            <BrandMark className="size-11" />
            <p className="mt-8 max-w-md text-4xl font-semibold leading-tight tracking-tight">
              {PRODUCT.tagline}
            </p>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
              {PRODUCT.description}
            </p>
          </div>

          <Card className="relative border-white/10 bg-white/5 p-6 shadow-none">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
              Built for a real search
            </p>
            <ul className="mt-5 space-y-4">
              {PRODUCT_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-6 text-slate-200">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-400/20 text-brand-200">
                    <NavigationIcon name="check" className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  );
}
