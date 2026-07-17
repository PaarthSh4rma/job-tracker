import { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AuthLoadingScreen } from "./features/auth/AuthLoadingScreen";
import { AuthScreen } from "./features/auth/AuthScreen";
import { ApplicationsWorkspace } from "./features/applications/ApplicationsWorkspace";
import { ApplicationsDataProvider } from "./features/applications/ApplicationsDataProvider";
import {
  getStoredAppView,
  storeAppView,
} from "./constants/navigation";
import { useToast } from "./components/ui";
import { AnalyticsPage, OverviewPage } from "./pages";
import { supabase } from "./supabaseClient";
import { userFacingError } from "./lib/userFacingError";

function App() {
  const { showToast } = useToast();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [authFeedback, setAuthFeedback] = useState(null);
  const [workspaceAction, setWorkspaceAction] = useState(null);
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
          message: userFacingError("session"),
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
    setWorkspaceAction(null);
    setSelectedView(view);
    storeAppView(globalThis.sessionStorage, view);
  };

  const openApplication = (applicationId) => {
    setWorkspaceAction({ type: "details", applicationId });
    setSelectedView("applications");
    storeAppView(globalThis.sessionStorage, "applications");
  };

  const addApplication = () => {
    setWorkspaceAction({ type: "create" });
    setSelectedView("applications");
    storeAppView(globalThis.sessionStorage, "applications");
  };

  const signOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast({
        tone: "error",
        title: "Unable to sign out",
        message: userFacingError("signOut"),
      });
    }
    setSigningOut(false);
  };

  if (authLoading) return <AuthLoadingScreen />;
  if (!session) return <AuthScreen initialFeedback={authFeedback} />;

  return (
    <ApplicationsDataProvider userId={session.user.id}>
      <AppShell
        selectedView={selectedView}
        onSelectView={selectView}
        email={session.user.email}
        onSignOut={() => void signOut()}
        signingOut={signingOut}
      >
        <div key={selectedView} className="view-enter">
          {selectedView === "overview" && (
            <OverviewPage
              onOpenApplications={() => selectView("applications")}
              onOpenApplication={openApplication}
              onAddApplication={addApplication}
            />
          )}
          {selectedView === "applications" && (
            <ApplicationsWorkspace initialAction={workspaceAction} />
          )}
          {selectedView === "analytics" && <AnalyticsPage />}
        </div>
      </AppShell>
    </ApplicationsDataProvider>
  );
}

export default App;
