import { Card, EmptyState, PageHeading } from "../components/ui";
import { NavigationIcon } from "../components/layout/NavigationIcon";

export function AnalyticsPage() {
  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Reporting foundation"
        title="Analytics"
        description="This space is reserved for useful, evidence-based reporting. Analytics functionality belongs to a later milestone."
      />

      <Card>
        <EmptyState
          icon={<NavigationIcon name="chart" />}
          title="Reporting will live here"
          description="No fabricated charts, conversion rates, or activity metrics are shown. This page currently establishes the future layout only."
          className="py-20"
        />
      </Card>
    </div>
  );
}
