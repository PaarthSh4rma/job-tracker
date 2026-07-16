import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { PageHeading, useToast } from "../../components/ui";
import { supabase } from "../../supabaseClient";
import {
  DEFAULT_APPLICATION_FILTERS,
  applicationWithStatus,
  applicationPayload,
  createApplicationForm,
  distinctSources,
  filterAndSortApplications,
  hasActiveFilters,
  hasApplicationChanges,
  replaceApplication,
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

function useDebouncedValue(value, delay = 180) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

export function ApplicationsWorkspace({ userId }) {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ ...DEFAULT_APPLICATION_FILTERS });
  const [sort, setSort] = useState("application-date");
  const [formValues, setFormValues] = useState(() => createApplicationForm());
  const [formErrors, setFormErrors] = useState({});
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const [workspace, dispatch] = useReducer(
    workspaceReducer,
    INITIAL_WORKSPACE_STATE,
  );
  const debouncedSearch = useDebouncedValue(search);

  const fetchApplications = useCallback(async (isActive = () => true) => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("application_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!isActive()) return;

    if (error) {
      showToast({
        tone: "error",
        title: "Applications could not be loaded",
        message: error.message,
      });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      await fetchApplications(() => active);
    };

    void loadApplications();
    return () => {
      active = false;
    };
  }, [fetchApplications]);

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

    setSaving(true);
    const payload = applicationPayload(formValues, userId);
    const query =
      workspace.panel === "create"
        ? supabase.from("applications").insert([payload])
        : supabase
            .from("applications")
            .update(payload)
            .eq("id", selectedApplication.id);
    const { data, error } = await query.select("*").single();

    if (error) {
      showToast({
        tone: "error",
        title:
          workspace.panel === "create"
            ? "Application was not added"
            : "Application was not updated",
        message: error.message,
      });
    } else if (workspace.panel === "create") {
      setApplications((current) => [data, ...current]);
      dispatch({ type: "open-details", applicationId: data.id });
      showToast({ title: "Application added" });
    } else {
      setApplications((current) =>
        current.map((application) =>
          application.id === data.id ? data : application,
        ),
      );
      dispatch({ type: "open-details", applicationId: data.id });
      showToast({ title: "Application updated" });
    }
    setSaving(false);
  };

  const updateStatus = async (application, status) => {
    if (status === application.status) return;
    const previous = application;
    setUpdatingId(application.id);
    setApplications((current) =>
      replaceApplication(
        current,
        applicationWithStatus(application, status, new Date().toISOString()),
      ),
    );

    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", application.id)
      .select("*")
      .single();

    if (error) {
      setApplications((current) => replaceApplication(current, previous));
      showToast({
        tone: "error",
        title: "Status was not updated",
        message: error.message,
      });
    } else {
      setApplications((current) => replaceApplication(current, data));
      showToast({ title: "Status updated" });
    }
    setUpdatingId(null);
  };

  const deleteApplication = async () => {
    if (!selectedApplication) return;
    setDeleting(true);
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", selectedApplication.id);

    if (error) {
      showToast({
        tone: "error",
        title: "Application was not deleted",
        message: error.message,
      });
      setDeleting(false);
      return;
    }

    setApplications((current) =>
      current.filter(({ id }) => id !== selectedApplication.id),
    );
    dispatch({ type: "close-panel" });
    setDeleting(false);
    showToast({ title: "Application deleted" });
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

      {loading ? (
        <ApplicationsLoading />
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
        deleting={deleting}
        onCancel={() => dispatch({ type: "cancel-delete" })}
        onConfirm={() => void deleteApplication()}
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
