import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../components/ui";
import { supabase } from "../../supabaseClient";
import {
  addApplicationToCollection,
  applicationWithStatus,
  removeApplicationFromCollection,
  replaceApplication,
  restoreApplicationFields,
} from "./applicationModel";
import { ApplicationsContext } from "./applicationsContext";

export function ApplicationsDataProvider({ userId, children }) {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const refresh = useCallback(async (isActive = () => true) => {
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .order("application_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!isActive()) return false;

    if (fetchError) {
      setError("Your applications could not be loaded. Please try again.");
      showToast({
        tone: "error",
        title: "Applications could not be loaded",
        message: fetchError.message,
      });
      setLoading(false);
      return false;
    }

    setApplications(data || []);
    setLoading(false);
    return true;
  }, [showToast]);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      await refresh(() => active);
    };

    void loadApplications();
    return () => {
      active = false;
    };
  }, [refresh, userId]);

  const createApplication = useCallback(async (payload) => {
    setSaving(true);
    const { data, error: createError } = await supabase
      .from("applications")
      .insert([{ ...payload, user_id: userId }])
      .select("*")
      .single();

    if (createError) {
      showToast({
        tone: "error",
        title: "Application was not added",
        message: createError.message,
      });
      setSaving(false);
      return null;
    }

    setApplications((current) => addApplicationToCollection(current, data));
    setSaving(false);
    showToast({ title: "Application added" });
    return data;
  }, [showToast, userId]);

  const updateApplication = useCallback(async (id, payload) => {
    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("applications")
      .update({ ...payload, user_id: userId })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      showToast({
        tone: "error",
        title: "Application was not updated",
        message: updateError.message,
      });
      setSaving(false);
      return null;
    }

    setApplications((current) => replaceApplication(current, data));
    setSaving(false);
    showToast({ title: "Application updated" });
    return data;
  }, [showToast, userId]);

  const deleteApplication = useCallback(async (application) => {
    setDeletingId(application.id);
    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", application.id);

    if (deleteError) {
      showToast({
        tone: "error",
        title: "Application was not deleted",
        message: deleteError.message,
      });
      setDeletingId(null);
      return false;
    }

    setApplications((current) =>
      removeApplicationFromCollection(current, application.id),
    );
    setDeletingId(null);
    showToast({ title: "Application deleted" });
    return true;
  }, [showToast]);

  const updateStatus = useCallback(async (application, status) => {
    if (status === application.status) return true;
    const optimistic = applicationWithStatus(
      application,
      status,
      new Date().toISOString(),
    );
    setUpdatingId(application.id);
    setApplications((current) => replaceApplication(current, optimistic));

    const { data, error: statusError } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", application.id)
      .select("*")
      .single();

    if (statusError) {
      setApplications((current) =>
        restoreApplicationFields(current, application.id, {
          status: application.status,
          updated_at: application.updated_at,
        }),
      );
      showToast({
        tone: "error",
        title: "Status was not updated",
        message: statusError.message,
      });
      setUpdatingId(null);
      return false;
    }

    setApplications((current) => replaceApplication(current, data));
    setUpdatingId(null);
    showToast({ title: "Status updated" });
    return true;
  }, [showToast]);

  const updateFollowUp = useCallback(async (application, nextFollowUpDate) => {
    const optimistic = {
      ...application,
      next_follow_up_date: nextFollowUpDate || null,
      updated_at: new Date().toISOString(),
    };
    setUpdatingId(application.id);
    setApplications((current) => replaceApplication(current, optimistic));

    const { data, error: followUpError } = await supabase
      .from("applications")
      .update({ next_follow_up_date: nextFollowUpDate || null })
      .eq("id", application.id)
      .select("*")
      .single();

    if (followUpError) {
      setApplications((current) =>
        restoreApplicationFields(current, application.id, {
          next_follow_up_date: application.next_follow_up_date,
          updated_at: application.updated_at,
        }),
      );
      showToast({
        tone: "error",
        title: "Follow-up was not updated",
        message: followUpError.message,
      });
      setUpdatingId(null);
      return false;
    }

    setApplications((current) => replaceApplication(current, data));
    setUpdatingId(null);
    showToast({
      title: nextFollowUpDate ? "Follow-up rescheduled" : "Follow-up cleared",
    });
    return true;
  }, [showToast]);

  const value = useMemo(
    () => ({
      applications,
      loading,
      error,
      saving,
      deletingId,
      updatingId,
      refresh,
      createApplication,
      updateApplication,
      deleteApplication,
      updateStatus,
      updateFollowUp,
    }),
    [
      applications,
      createApplication,
      deleteApplication,
      deletingId,
      error,
      loading,
      refresh,
      saving,
      updateApplication,
      updateFollowUp,
      updateStatus,
      updatingId,
    ],
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}
