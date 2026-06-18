"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminStatsCards from "@/components/dashboard/AdminDashboard/AdminStatsCards";
import AdminQuickActions from "@/components/dashboard/AdminDashboard/AdminQuickActions";
import AdminCharts from "@/components/dashboard/AdminDashboard/AdminCharts";
import AdminRecentUsers from "@/components/dashboard/AdminDashboard/AdminRecentUsers";
import AdminRecentOwners from "@/components/dashboard/AdminDashboard/AdminRecentOwners";
import AdminRecentBookings from "@/components/dashboard/AdminDashboard/AdminRecentBookings";
import AdminRecentPayments from "@/components/dashboard/AdminDashboard/AdminRecentPayments";
import AdminRecentContactQueries from "@/components/dashboard/AdminDashboard/AdminRecentContactQueries";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";

export default function AdminDashboard() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        <DashboardGreeting subtitle="Here's an overview of your platform." />

        {/* Stats Cards */}
        <AdminStatsCards />

        {/* Quick Actions */}
        <AdminQuickActions />

        {/* Charts and Analytics */}
        <AdminCharts />

        {/* Recent Data - 3 columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminRecentUsers />
          <AdminRecentOwners />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminRecentBookings />
          <AdminRecentPayments />
        </div>

        <AdminRecentContactQueries />
      </div>
    </AdminDashboardLayout>
  );
}

