import { Badge, Card, EmptyState, PageHeading, SectionHeading } from "../components/ui";
import { NavigationIcon } from "../components/layout/NavigationIcon";

const FOUNDATIONS = [
  {
    title: "One dependable workspace",
    description:
      "Applications remain organised under your account, with a clear path into the tools that support your search.",
  },
  {
    title: "Privacy by default",
    description:
      "Your workspace only requests records associated with your authenticated user identity.",
  },
  {
    title: "Focused, not noisy",
    description:
      "The shell prioritises the information you need without invented metrics or distracting dashboard decoration.",
  },
];

export function OverviewPage({ onOpenApplications }) {
  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Your workspace"
        title="A calmer way to run your search"
        description="Trackline now has a focused home for your applications, future reporting, and the decisions that keep opportunities moving."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {FOUNDATIONS.map((item, index) => (
          <Card key={item.title} className="p-5 sm:p-6">
            <Badge tone={index === 0 ? "brand" : "neutral"}>
              Foundation {index + 1}
            </Badge>
            <h2 className="mt-5 text-lg font-semibold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <SectionHeading
            title="Your next step"
            description="The current milestone establishes navigation and hierarchy without fabricating activity data."
          />
        </div>
        <EmptyState
          icon={<NavigationIcon name="applications" />}
          title="Your application workspace is ready"
          description="Open Applications to use the existing create, status-update, ordering, and delete workflow."
          action={
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              onClick={onOpenApplications}
            >
              Open Applications
              <NavigationIcon name="arrow" className="size-4" />
            </button>
          }
        />
      </Card>
    </div>
  );
}
