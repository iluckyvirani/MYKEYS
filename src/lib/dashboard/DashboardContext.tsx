"use client";

import { createContext, useContext } from "react";

export type DashboardPanelRole = "user" | "owner" | "agent" | "service";

type DashboardContextValue = {
  role: DashboardPanelRole;
  basePath: string;
};

const DashboardContext = createContext<DashboardContextValue>({
  role: "user",
  basePath: "/user/dashboard",
});

export function DashboardProvider({
  role,
  children,
}: {
  role: DashboardPanelRole;
  children: React.ReactNode;
}) {
  const basePath =
    role === "owner"
      ? "/owner/dashboard"
      : role === "agent"
        ? "/agent/dashboard"
        : role === "service"
          ? "/service/dashboard"
          : "/user/dashboard";

  return (
    <DashboardContext.Provider value={{ role, basePath }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardBase() {
  return useContext(DashboardContext);
}
