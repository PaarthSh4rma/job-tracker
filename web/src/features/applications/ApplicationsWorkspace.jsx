import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Alert, PageHeading } from "../../components/ui";
import { cn } from "../../lib/cn";
import {
  DEFAULT_APPLICATION_FILTERS,
  applicationPayload,
  createApplicationForm,
  distinctSources,
  filterAndSortApplications,
  hasActiveFilters,
  hasApplicationChanges,
  validateApplication,
} from "./applicationModel";
import {
  INITIAL_WORKSPACE_STATE,
  workspaceReducer,
} from "./workspaceState";
import { ApplicationsToolbar } from "./ApplicationsToolbar";
import {
  ApplicationsList,
  ApplicationsLoading,
} from "./ApplicationsList";
import { ApplicationDrawer } from "./ApplicationDrawer";
import {
  DeleteApplicationDialog,
  DiscardChangesDialog,
} from "./ApplicationConfirmations";
import { useApplications } from "./applicationsContext";
import { ApplicationsPipeline } from "./ApplicationsPipeline";
import {
  getStoredApplicationsView,
  storeApplicationsView,
} from "./applicationsView";

function useDebouncedValue(value, delay = 180) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

function initialWorkspaceState(action) {
  if (action?.type === "create") {
    return { panel: "create", applicationId: null, deleteConfirmationOpen: false };
  }
  if (action?.type === "details") {
    return {
      panel: "details",
      applicationId: action.applicationId,
      deleteConfirmationOpen: false,
    };
  }
  return INITIAL_WORKSPACE_STATE;
}

export function ApplicationsWorkspace({ initialAction = null }) {
  const {
    applications,
    loading,
    error,
    saving,
    deletingId,
    updatingId,
    createApplication,
    updateApplication,
    deleteApplication,
    updateStatus,
  } = useApplications();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ ...DEFAULT_APPLICATION_FILTERS });
  const [sort, setSort] = useState("application-date");
  const [applicationsView, setApplicationsView] = useState(() =>
    getStoredApplicationsView(globalThis.sessionStorage),
  );
  const [formValues, setFormValues] = useState(() => createApplicationForm());
  const [formErrors, setFormErrors] = useState({});
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const [workspace, dispatch] = useReducer(
    workspaceReducer,
    initialAction,
    initialWorkspaceState,
  );
  const debouncedSearch = useDebouncedValue(search);

  const visibleApplications = useMemo(
    () =>
      filterAndSortApplications(applications, {
        search: debouncedSearch,
        filters,
        sort,
      }),
    [applications, debouncedSearch, filters, sort],
  );
  const sources = useMemo(() => distinctSources(applications), [applications]);
  const selectedApplication = useMemo(
    () =>
      applications.find(({ id }) => id === workspace.applicationId) ?? null,
    [applications, workspace.applicationId],
  );
  const activeFilters = hasActiveFilters(filters, search);
  const formDirty =
    (workspace.panel === "create" &&
      hasApplicationChanges(formValues, null)) ||
    (workspace.panel === "edit" &&
      selectedApplication &&
      hasApplicationChanges(formValues, selectedApplication));

  const clearFilters = () => {
    setSearch("");
    setFilters({ ...DEFAULT_APPLICATION_FILTERS });
  };

  const selectApplicationsView = (view) => {
    setApplicationsView(view);
    storeApplicationsView(globalThis.sessionStorage, view);
  };

  const openCreate = () => {
    setFormValues(createApplicationForm());
    setFormErrors({});
    dispatch({ type: "open-create" });
  };

  const openDetails = (applicationId) => {
    setFormErrors({});
    dispatch({ type: "open-details", applicationId });
  };

  const openEdit = () => {
    if (!selectedApplication) return;
    setFormValues(createApplicationForm(selectedApplication));
    setFormErrors({});
    dispatch({ type: "open-edit" });
  };

  const requestClosePanel = useCallback(() => {
    if (formDirty) {
      setDiscardConfirmationOpen(true);
      return;
    }
    dispatch({ type: "close-panel" });
  }, [formDirty]);

  const updateForm = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const saveApplication = async (event) => {
    event.preventDefault();
    const errors = validateApplication(formValues);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const formId =
        workspace.panel === "create"
          ? "create-application"
          : "edit-application";
      const firstField = Object.keys(errors)[0].replaceAll("_", "-");
      window.requestAnimationFrame(() => {
        document.getElementById(`${formId}-${firstField}`)?.focus();
      });
      return;
    }

    const payload = applicationPayload(formValues);
    const data =
      workspace.panel === "create"
        ? await createApplication(payload)
        : await updateApplication(selectedApplication.id, payload);

    if (data) {
      dispatch({ type: "open-details", applicationId: data.id });
    }
  };

  const confirmDeleteApplication = async () => {
    if (!selectedApplication) return;
    const deleted = await deleteApplication(selectedApplication);
    if (deleted) dispatch({ type: "close-panel" });
  };

  const drawerMode =
    workspace.deleteConfirmationOpen || discardConfirmationOpen
      ? null
      : workspace.panel;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Workspace"
        title="Applications"
        description={
          loading
            ? "Loading your application workspace…"
            : `${applications.length} ${
                applications.length === 1 ? "application" : "applications"
              } in your private workspace.`
        }
      />

      {error && (
        <Alert tone="error" title="Applications unavailable">
          {error}
        </Alert>
      )}

      <ApplicationsToolbar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={(field, value) =>
          setFilters((current) => ({ ...current, [field]: value }))
        }
        sort={sort}
        onSortChange={setSort}
        sources={sources}
        onClear={clearFilters}
        onAdd={openCreate}
      />

      <div
        className="flex w-fit rounded-xl bg-subtle p-1"
        role="group"
        aria-label="Applications view"
      >
        {["list", "pipeline"].map((view) => {
          const selected = applicationsView === view;
          return (
            <button
              key={view}
              type="button"
              aria-pressed={selected}
              className={cn(
                "min-h-9 rounded-lg px-4 text-sm font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                selected ? "bg-surface text-ink shadow-control" : "text-muted",
              )}
              onClick={() => selectApplicationsView(view)}
            >
              {view}
            </button>
          );
        })}
      </div>

      {loading ? (
        <ApplicationsLoading />
      ) : applicationsView === "pipeline" ? (
        <ApplicationsPipeline
          applications={visibleApplications}
          updatingId={updatingId}
          onOpen={openDetails}
          onStatusChange={(application, status) =>
            void updateStatus(application, status)
          }
        />
      ) : (
        <ApplicationsList
          applications={visibleApplications}
          totalCount={applications.length}
          filtered={activeFilters}
          updatingId={updatingId}
          onOpen={openDetails}
          onStatusChange={(application, status) =>
            void updateStatus(application, status)
          }
          onAdd={openCreate}
          onClear={clearFilters}
        />
      )}

      <ApplicationDrawer
        mode={drawerMode}
        application={selectedApplication}
        values={formValues}
        errors={formErrors}
        saving={saving}
        onChange={updateForm}
        onSubmit={(event) => void saveApplication(event)}
        onClose={requestClosePanel}
        onEdit={openEdit}
        onDelete={() => dispatch({ type: "request-delete" })}
      />

      <DeleteApplicationDialog
        open={workspace.deleteConfirmationOpen}
        application={selectedApplication}
        deleting={deletingId === selectedApplication?.id}
        onCancel={() => dispatch({ type: "cancel-delete" })}
        onConfirm={() => void confirmDeleteApplication()}
      />

      <DiscardChangesDialog
        open={discardConfirmationOpen}
        onCancel={() => setDiscardConfirmationOpen(false)}
        onDiscard={() => {
          setDiscardConfirmationOpen(false);
          dispatch({ type: "close-panel" });
        }}
      />
    </div>
  );
}
