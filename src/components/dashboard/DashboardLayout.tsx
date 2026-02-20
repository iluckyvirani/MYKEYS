"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RoleSwitcher from "./RoleSwitcher";


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
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-50">
        {/* Header */}
        <Header
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
          onRoleChange={setRole}
        />

        {/* Main Content Area */}
        <main className="py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-5">
            {/* Role Switcher Banner */}
            <RoleSwitcher currentRole={role} onSwitch={setRole} />

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}