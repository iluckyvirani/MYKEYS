"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import ProtectAdminRoute from "./ProtectAdminRoute";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectAdminRoute>
      <div className="dashboard-app min-h-screen bg-gray-100 overflow-x-clip">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="min-w-0 xl:pl-64">
          <Header
            role="admin"
            onMenuClick={() => setSidebarOpen(true)}
            onRoleChange={() => {}}
          />

          <main className="py-4 sm:py-5">
            <div className="mx-auto w-full max-w-7xl min-w-0 px-3 sm:px-4 lg:px-5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectAdminRoute>
  );
}
