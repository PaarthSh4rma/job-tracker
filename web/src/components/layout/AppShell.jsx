import { useCallback, useState } from "react";
import { APP_VIEWS } from "../../constants/navigation";
import { cn } from "../../lib/cn";
import { Button, IconButton, Modal } from "../ui";
import { Brand } from "./Brand";
import { NavigationIcon } from "./NavigationIcon";
import { AppearanceControl } from "../../features/appearance/AppearanceControl";

function Navigation({ selectedView, onSelect, onNavigate }) {
  return (
    <nav aria-label="Primary navigation" className="space-y-1">
      {APP_VIEWS.map((view) => {
        const active = selectedView === view.id;
        return (
          <button
            key={view.id}
            type="button"
            className={cn(
              "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              active
                ? "bg-brand-50 text-brand-800 dark:bg-emerald-950 dark:text-brand-200"
                : "text-muted hover:bg-subtle hover:text-ink",
            )}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              onSelect(view.id);
              onNavigate?.();
            }}
          >
            <NavigationIcon name={view.id} />
            <span>{view.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Account({ email, onSignOut, signingOut }) {
  return (
    <div className="border-t border-line pt-4">
      <div className="mb-4">
        <AppearanceControl />
      </div>
      <div className="mb-3 min-w-0 px-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-faint">
          Signed in as
        </p>
        <p className="mt-1 break-all text-sm text-ink" title={email}>
          {email}
        </p>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={onSignOut}
        loading={signingOut}
      >
        <NavigationIcon name="logout" />
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}

export function AppShell({
  selectedView,
  onSelectView,
  email,
  onSignOut,
  signingOut,
  children,
}) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const closeMobileNavigation = useCallback(
    () => setMobileNavigationOpen(false),
    [],
  );
  const currentView = APP_VIEWS.find(({ id }) => id === selectedView);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface px-4 py-5 lg:flex lg:flex-col">
        <Brand className="px-2" />
        <div className="mt-9 flex-1">
          <Navigation selectedView={selectedView} onSelect={onSelectView} />
        </div>
        <Account
          email={email}
          onSignOut={onSignOut}
          signingOut={signingOut}
        />
      </aside>

      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur-sm lg:hidden">
        <Brand compact />
        <p className="truncate px-3 text-sm font-semibold text-ink">
          {currentView?.label}
        </p>
        <IconButton
          label="Open navigation"
          aria-expanded={mobileNavigationOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileNavigationOpen(true)}
        >
          <NavigationIcon name="menu" />
        </IconButton>
      </header>

      <Modal
        open={mobileNavigationOpen}
        onClose={closeMobileNavigation}
        title="Navigation"
        panelId="mobile-navigation"
      >
        <Brand className="mt-6 rounded-xl bg-subtle p-3" />
        <div className="mt-6">
          <Navigation
            selectedView={selectedView}
            onSelect={onSelectView}
            onNavigate={closeMobileNavigation}
          />
        </div>
        <div className="mt-auto pt-6">
          <Account
            email={email}
            onSignOut={onSignOut}
            signingOut={signingOut}
          />
        </div>
      </Modal>

      <main id="main-content" className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
