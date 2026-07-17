import { Alert, Button, Card, EmptyState, PageHeading, SectionHeading } from "../components/ui";
import { NavigationIcon } from "../components/layout/NavigationIcon";
import { useApplications } from "../features/applications/applicationsContext";
import { ApplicationStatusBadge } from "../features/applications/ApplicationStatusBadge";
import { formatDate } from "../features/applications/applicationModel";
import { formatRate } from "../features/insights/analyticsModel";
import { useApplicationAnalytics } from "../features/insights/useApplicationAnalytics";
import {
  DashboardLoading,
  DistributionBars,
  FollowUpPanel,
  MetricCard,
  WeeklyActivity,
} from "../features/insights/InsightComponents";

export function OverviewPage({
  onOpenApplications,
  onOpenApplication,
  onAddApplication,
}) {
  const {
    applications,
    loading,
    error,
    updatingId,
    updateFollowUp,
    refresh,
  } = useApplications();
  const { analytics, calculationError } = useApplicationAnalytics(applications);
  const dashboardError = error || calculationError;

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Overview"
        title="Your job-search dashboard"
        description="Current metrics and follow-ups from the applications stored in your account."
        action={
          <Button onClick={onAddApplication}>
            <NavigationIcon name="plus" />
            Add application
          </Button>
        }
      />

      {dashboardError && (
        <Alert tone="error" title="Dashboard unavailable">
          <p>{dashboardError}</p>
          <Button className="mt-3" size="sm" variant="secondary" onClick={() => void refresh()}>
            Try again
          </Button>
        </Alert>
      )}

      {loading ? (
        <DashboardLoading variant="overview" />
      ) : dashboardError ? null : applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<NavigationIcon name="applications" />}
            title="No applications tracked yet"
            description="Add an application to begin seeing pipeline metrics, weekly activity, and follow-up dates."
            action={<Button onClick={onAddApplication}>Add application</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label="Total applications"
              value={analytics.total}
              context="All applications currently stored."
              emphasis
            />
            <MetricCard
              label="Active applications"
              value={analytics.active}
              context="Saved through offer statuses."
              emphasis
            />
            <MetricCard
              label="Responses"
              value={analytics.responses}
              context="Current screening, interview, offer, or rejected statuses."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Interviews" value={analytics.interviews} />
            <MetricCard label="Offers" value={analytics.offers} />
            <MetricCard
              label="Response rate"
              value={formatRate(analytics.responseRate)}
              context="Responses ÷ non-saved applications."
            />
            <MetricCard
              label="Interview conversion"
              value={formatRate(analytics.interviewConversionRate)}
              context="Current interview or offer ÷ non-saved applications."
            />
            <MetricCard
              label="Offer conversion"
              value={formatRate(analytics.offerConversionRate)}
              context="Current offers ÷ non-saved applications."
            />
            <MetricCard
              label="Closed"
              value={analytics.closed}
              context="Rejected or withdrawn."
            />
          </div>

          <p className="text-xs leading-5 text-faint">
            Conversion figures use each application’s current status. Trackline does not
            infer a historical funnel without status-history data.
          </p>

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <FollowUpPanel
              followUps={analytics.followUps}
              updatingId={updatingId}
              onOpen={onOpenApplication}
              onUpdate={(application, date) => void updateFollowUp(application, date)}
            />

            <Card className="p-5 sm:p-6">
              <SectionHeading
                title="Recent applications"
                description="The five most recently created records."
                action={
                  <Button variant="ghost" size="sm" onClick={onOpenApplications}>
                    View all
                  </Button>
                }
              />
              <ul className="mt-5 divide-y divide-line">
                {analytics.recentApplications.map((application) => (
                  <li key={application.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      onClick={() => onOpenApplication(application.id)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">
                          {application.company}
                        </span>
                        <span className="mt-1 block truncate text-sm text-muted">
                          {application.role} · {formatDate(application.application_date)}
                        </span>
                      </span>
                      <ApplicationStatusBadge status={application.status} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <DistributionBars
              title="Status distribution"
              description="Applications by current stored status."
              data={analytics.statusDistribution}
            />
            <WeeklyActivity activity={analytics.recentWeeklyActivity} />
          </div>
        </>
      )}
    </div>
  );
}
