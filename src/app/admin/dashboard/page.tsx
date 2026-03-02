"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminStatsCards from "@/components/dashboard/AdminDashboard/AdminStatsCards";
import AdminQuickActions from "@/components/dashboard/AdminDashboard/AdminQuickActions";
import AdminCharts from "@/components/dashboard/AdminDashboard/AdminCharts";
import AdminRecentUsers from "@/components/dashboard/AdminDashboard/AdminRecentUsers";
import AdminRecentBookings from "@/components/dashboard/AdminDashboard/AdminRecentBookings";
import AdminRecentPayments from "@/components/dashboard/AdminDashboard/AdminRecentPayments";

export default function AdminDashboard() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your platform.</p>
        </div>

        {/* Stats Cards */}
        <AdminStatsCards />

        {/* Quick Actions */}
        <AdminQuickActions />

        {/* Charts and Analytics */}
        <AdminCharts />

        {/* Recent Data - 3 columns layout */}
        <div className="grid grid-cols-1 gap-6">
          <AdminRecentUsers />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminRecentBookings />
          <AdminRecentPayments />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

