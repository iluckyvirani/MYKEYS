"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RoleSwitcher from "./RoleSwitcher";
import ProfileCompletionBanner from "./ProfileCompletionBanner";
import {
  DashboardPanelRole,
  DashboardProvider,
} from "@/lib/dashboard/DashboardContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  defaultRole?: DashboardPanelRole;
}

export default function DashboardLayout({
  children,
  defaultRole = "user",
}: DashboardLayoutProps) {
  const [role, setRole] = useState<DashboardPanelRole>(defaultRole);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardProvider role={role}>
      <div className="dashboard-app min-h-screen bg-gray-100 overflow-x-clip">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="min-w-0 xl:pl-64">
          <Header
            role={role}
            onMenuClick={() => setSidebarOpen(true)}
            onRoleChange={setRole}
          />

          <main className="py-4 sm:py-5">
            <div className="mx-auto w-full max-w-7xl min-w-0 px-3 sm:px-4 lg:px-5">
              <RoleSwitcher currentRole={role} onSwitch={setRole} />

              <ProfileCompletionBanner role={role} />

              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
