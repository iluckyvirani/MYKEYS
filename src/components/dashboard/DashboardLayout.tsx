"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RoleSwitcher from "./RoleSwitcher";
import ProfileCompletionBanner from "./ProfileCompletionBanner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  defaultRole?: "user" | "owner" | "service";
}

export default function DashboardLayout({
  children,
  defaultRole = "user",
}: DashboardLayoutProps) {
  const [role, setRole] = useState<"user" | "owner" | "service">(defaultRole);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Header
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
          onRoleChange={setRole}
        />

        <main className="py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-1">
            <RoleSwitcher currentRole={role} onSwitch={setRole} />

            {/* Optional profile % — no access restriction */}
            <ProfileCompletionBanner role={role} />

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
