import { useCallback, useEffect, useState } from "react";
import {
  APPLICATION_STATUSES,
  DEFAULT_APPLICATION_STATUS,
} from "../../constants/application";
import {
  Button,
  Card,
  EmptyState,
  Input,
  PageHeading,
  Select,
  Skeleton,
  useToast,
} from "../../components/ui";
import { NavigationIcon } from "../../components/layout/NavigationIcon";
import { supabase } from "../../supabaseClient";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function ApplicationsLoading() {
  return (
    <Card className="overflow-hidden" aria-label="Loading applications">
      <div className="space-y-4 p-6">
        {[0, 1, 2].map((item) => (
          <div key={item} className="grid grid-cols-[1fr_1fr_7rem] gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ApplicationsWorkspace({ userId }) {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState(DEFAULT_APPLICATION_STATUS);
  const [applicationDate, setApplicationDate] = useState(today);

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
      if (!active) return;
      setLoading(false);
    };

    void loadApplications();
    return () => {
      active = false;
    };
  }, [fetchApplications]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("applications").insert([
      {
        user_id: userId,
        company: company.trim(),
        role: role.trim(),
        status,
        application_date: applicationDate,
      },
    ]);

    if (error) {
      showToast({
        tone: "error",
        title: "Application was not added",
        message: error.message,
      });
    } else {
      setCompany("");
      setRole("");
      setStatus(DEFAULT_APPLICATION_STATUS);
      setApplicationDate(today());
      await fetchApplications();
      showToast({ title: "Application added" });
    }

    setSubmitting(false);
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      showToast({
        tone: "error",
        title: "Status was not updated",
        message: error.message,
      });
    } else {
      await fetchApplications();
      showToast({ title: "Status updated" });
    }
    setUpdatingId(null);
  };

  const deleteApplication = async (id) => {
    setDeletingId(id);
    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      showToast({
        tone: "error",
        title: "Application was not deleted",
        message: error.message,
      });
    } else {
      await fetchApplications();
      showToast({ title: "Application deleted" });
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Workspace"
        title="Applications"
        description="Your existing application workflow is preserved here. A broader management redesign belongs to the next milestone."
      />

      <Card className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            id="application-company"
            label="Company"
            placeholder="Company name"
            value={company}
            disabled={submitting}
            onChange={(event) => setCompany(event.target.value)}
            required
          />
          <Input
            id="application-role"
            label="Role"
            placeholder="Role title"
            value={role}
            disabled={submitting}
            onChange={(event) => setRole(event.target.value)}
            required
          />
          <Input
            id="application-date"
            label="Application date"
            type="date"
            value={applicationDate}
            disabled={submitting}
            onChange={(event) => setApplicationDate(event.target.value)}
            required
          />
          <Select
            id="application-status"
            label="Status"
            value={status}
            disabled={submitting}
            onChange={(event) => setStatus(event.target.value)}
          >
            {APPLICATION_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            type="submit"
            className="md:col-span-2 xl:col-span-4"
            loading={submitting}
          >
            {submitting ? "Adding application…" : "Add application"}
          </Button>
        </form>
      </Card>

      {loading ? (
        <ApplicationsLoading />
      ) : (
        <Card className="overflow-hidden">
          {applications.length === 0 ? (
            <EmptyState
              icon={<NavigationIcon name="inbox" />}
              title="No applications yet"
              description="Add your first application using the form above. It will stay private to your account."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="border-b border-line bg-subtle/70">
                  <tr>
                    {['Company', 'Role', 'Application date', 'Status'].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">
                        {heading}
                      </th>
                    ))}
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {applications.map((application) => (
                    <tr key={application.id} className="transition-colors hover:bg-subtle/60">
                      <td className="px-5 py-4 font-medium text-ink">{application.company}</td>
                      <td className="px-5 py-4 text-sm text-muted">{application.role}</td>
                      <td className="px-5 py-4 text-sm text-muted">{application.application_date}</td>
                      <td className="px-5 py-4">
                        <label className="sr-only" htmlFor={`status-${application.id}`}>
                          Status for {application.company}
                        </label>
                        <select
                          id={`status-${application.id}`}
                          className="min-h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:opacity-60"
                          value={application.status}
                          disabled={updatingId === application.id}
                          onChange={(event) => void updateStatus(application.id, event.target.value)}
                        >
                          {APPLICATION_STATUSES.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger-700 hover:bg-danger-50 hover:text-danger-800"
                          loading={deletingId === application.id}
                          onClick={() => void deleteApplication(application.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
