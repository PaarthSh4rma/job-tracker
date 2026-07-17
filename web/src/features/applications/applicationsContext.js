import { createContext, useContext } from "react";

export const ApplicationsContext = createContext(null);

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error("useApplications must be used within ApplicationsDataProvider");
  }
  return context;
}
