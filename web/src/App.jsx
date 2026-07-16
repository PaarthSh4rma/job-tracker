import { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AuthLoadingScreen } from "./features/auth/AuthLoadingScreen";
import { AuthScreen } from "./features/auth/AuthScreen";
import { ApplicationsWorkspace } from "./features/applications/ApplicationsWorkspace";
import {
  getStoredAppView,
  storeAppView,
} from "./constants/navigation";
import { useToast } from "./components/ui";
import { AnalyticsPage, OverviewPage } from "./pages";
import { supabase } from "./supabaseClient";

function App() {
  const { showToast } = useToast();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [authFeedback, setAuthFeedback] = useState(null);
  const [selectedView, setSelectedView] = useState(() =>
    getStoredAppView(globalThis.sessionStorage),
  );

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setAuthFeedback({
          type: "error",
          title: "Session could not be restored",
          message: "Please sign in again to continue.",
        });
        setSession(null);
      } else {
        setSession(data.session);
      }
      setAuthLoading(false);
    };

    void initializeSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!active) return;
        setSession(newSession);
        setAuthLoading(false);
        if (newSession) setAuthFeedback(null);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const selectView = (view) => {
    setSelectedView(view);
    storeAppView(globalThis.sessionStorage, view);
  };

  const signOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast({
        tone: "error",
        title: "Unable to sign out",
        message: error.message,
      });
    }
    setSigningOut(false);
  };

  if (authLoading) return <AuthLoadingScreen />;
  if (!session) return <AuthScreen initialFeedback={authFeedback} />;

  return (
    <AppShell
      selectedView={selectedView}
      onSelectView={selectView}
      email={session.user.email}
      onSignOut={() => void signOut()}
      signingOut={signingOut}
    >
      {selectedView === "overview" && (
        <OverviewPage onOpenApplications={() => selectView("applications")} />
      )}
      {selectedView === "applications" && (
        <ApplicationsWorkspace userId={session.user.id} />
      )}
      {selectedView === "analytics" && <AnalyticsPage />}
    </AppShell>
  );
}

export default App;
