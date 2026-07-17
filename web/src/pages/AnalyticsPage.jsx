import { Alert, Card, EmptyState, PageHeading } from "../components/ui";
import { NavigationIcon } from "../components/layout/NavigationIcon";
import { useApplications } from "../features/applications/applicationsContext";
import { formatRate } from "../features/insights/analyticsModel";
import { useApplicationAnalytics } from "../features/insights/useApplicationAnalytics";
import {
  DashboardLoading,
  DistributionBars,
  MetricCard,
  WeeklyActivity,
} from "../features/insights/InsightComponents";

export function AnalyticsPage() {
  const { applications, loading, error } = useApplications();
  const { analytics, calculationError } = useApplicationAnalytics(applications);
  const analyticsError = error || calculationError;

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Analytics"
        title="Application insights"
        description="Aggregates from the current applications stored in your account."
      />

      {analyticsError && (
        <Alert tone="error" title="Analytics unavailable">
          {analyticsError}
        </Alert>
      )}

      {loading ? (
        <DashboardLoading />
      ) : analyticsError ? null : applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<NavigationIcon name="chart" />}
            title="No analytics available yet"
            description="Analytics will appear after applications are added to your workspace."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Response rate"
              value={formatRate(analytics.responseRate)}
              context="Responses ÷ non-saved applications."
              emphasis
            />
            <MetricCard
              label="Interview conversion"
              value={formatRate(analytics.interviewConversionRate)}
              context="Current interview or offer statuses."
            />
            <MetricCard
              label="Offer conversion"
              value={formatRate(analytics.offerConversionRate)}
              context="Current offers ÷ non-saved applications."
            />
            <MetricCard
              label="Average per active week"
              value={
                analytics.averageApplicationsPerActiveWeek === null
                  ? "Unavailable"
                  : analytics.averageApplicationsPerActiveWeek.toFixed(1)
              }
              context="Dated applications ÷ weeks with at least one application."
            />
          </div>

          <p className="text-xs leading-5 text-faint">
            Rates use current status only and are not a historical funnel. Saved
            applications are excluded from conversion denominators.
          </p>

          <div className="grid gap-6 xl:grid-cols-2">
            <DistributionBars
              title="Applications by status"
              description="Current pipeline distribution."
              data={analytics.statusDistribution}
            />
            <WeeklyActivity activity={analytics.recentWeeklyActivity} />
            <DistributionBars
              title="Top sources"
              description="Sources recorded on applications."
              data={analytics.sourceDistribution}
              emptyMessage="Add a source to applications to see this breakdown."
              limit={8}
            />
            <DistributionBars
              title="Most common roles"
              description="Role titles grouped case-insensitively."
              data={analytics.commonRoles}
              limit={8}
            />
            <DistributionBars
              title="Work-mode distribution"
              description="Current work-mode preferences in the pipeline."
              data={analytics.workModeDistribution}
            />
            <DistributionBars
              title="Employment-type distribution"
              description="Employment types stored on applications."
              data={analytics.employmentTypeDistribution}
            />
          </div>
        </>
      )}
    </div>
  );
}
