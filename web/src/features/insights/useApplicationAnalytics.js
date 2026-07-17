import { useMemo } from "react";
import { computeAnalytics } from "./analyticsModel";

export function useApplicationAnalytics(applications) {
  return useMemo(() => {
    try {
      return { analytics: computeAnalytics(applications), calculationError: null };
    } catch {
      return {
        analytics: null,
        calculationError:
          "Insights could not be calculated from the current application data.",
      };
    }
  }, [applications]);
}
