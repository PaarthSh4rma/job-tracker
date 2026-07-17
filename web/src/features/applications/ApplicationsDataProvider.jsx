import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { userFacingError } from "../../lib/userFacingError";

export function ApplicationsDataProvider({ userId, children }) {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const savingRef = useRef(false);
  const deletingIdsRef = useRef(new Set());
  const updatingIdsRef = useRef(new Set());

  const refresh = useCallback(async (isActive = () => true) => {
    setError(null);
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .order("application_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!isActive()) return false;

    if (fetchError) {
      const message = userFacingError("load");
      setError(message);
      showToast({
        tone: "error",
        title: "Applications could not be loaded",
        message,
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
    if (savingRef.current) return null;
    savingRef.current = true;
    setSaving(true);
    const { data, error: createError } = await supabase
      .from("applications")
      .insert([{ ...payload, user_id: userId }])
      .select("*")
      .single();

    if (createError) {
      const message = userFacingError("create");
      showToast({
        tone: "error",
        title: "Application was not added",
        message,
      });
      savingRef.current = false;
      setSaving(false);
      return null;
    }

    setApplications((current) => addApplicationToCollection(current, data));
    savingRef.current = false;
    setSaving(false);
    showToast({ title: "Application added" });
    return data;
  }, [showToast, userId]);

  const updateApplication = useCallback(async (id, payload) => {
    if (savingRef.current) return null;
    savingRef.current = true;
    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("applications")
      .update({ ...payload, user_id: userId })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      const message = userFacingError("update");
      showToast({
        tone: "error",
        title: "Application was not updated",
        message,
      });
      savingRef.current = false;
      setSaving(false);
      return null;
    }

    setApplications((current) => replaceApplication(current, data));
    savingRef.current = false;
    setSaving(false);
    showToast({ title: "Application updated" });
    return data;
  }, [showToast, userId]);

  const deleteApplication = useCallback(async (application) => {
    if (deletingIdsRef.current.has(application.id)) return false;
    deletingIdsRef.current.add(application.id);
    setDeletingId(application.id);
    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", application.id);

    if (deleteError) {
      const message = userFacingError("delete");
      showToast({
        tone: "error",
        title: "Application was not deleted",
        message,
      });
      deletingIdsRef.current.delete(application.id);
      setDeletingId(null);
      return false;
    }

    setApplications((current) =>
      removeApplicationFromCollection(current, application.id),
    );
    deletingIdsRef.current.delete(application.id);
    setDeletingId(null);
    showToast({ title: "Application deleted" });
    return true;
  }, [showToast]);

  const updateStatus = useCallback(async (application, status) => {
    if (status === application.status) return true;
    if (updatingIdsRef.current.has(application.id)) return false;
    updatingIdsRef.current.add(application.id);
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
        message: userFacingError("status"),
      });
      updatingIdsRef.current.delete(application.id);
      setUpdatingId(null);
      return false;
    }

    setApplications((current) => replaceApplication(current, data));
    updatingIdsRef.current.delete(application.id);
    setUpdatingId(null);
    showToast({ title: "Status updated" });
    return true;
  }, [showToast]);

  const updateFollowUp = useCallback(async (application, nextFollowUpDate) => {
    if (updatingIdsRef.current.has(application.id)) return false;
    updatingIdsRef.current.add(application.id);
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
        message: userFacingError("followUp"),
      });
      updatingIdsRef.current.delete(application.id);
      setUpdatingId(null);
      return false;
    }

    setApplications((current) => replaceApplication(current, data));
    updatingIdsRef.current.delete(application.id);
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
