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
      <div className="min-h-screen bg-gray-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Header */}
          <Header
            role="admin"
            onMenuClick={() => setSidebarOpen(true)}
            onRoleChange={() => {}}
          />

          {/* Main Content Area */}
          <main className="py-5">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-8">
              {/* Page Content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectAdminRoute>
  );
}
