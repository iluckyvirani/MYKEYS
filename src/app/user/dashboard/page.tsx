// app/(user)/dashboard/page.tsx - Updated Version
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/UserDashboard/StatsCards";
import RecentBookings from "@/components/dashboard/UserDashboard/RecentBookings";
import ActiveInquiries from "@/components/dashboard/UserDashboard/ActiveInquiries";
import FavoriteProperties from "@/components/dashboard/UserDashboard/FavoriteProperties";
import RecentPayments from "@/components/dashboard/UserDashboard/RecentPayments";
import QuickActions from "@/components/dashboard/UserDashboard/QuickActions";
import Notifications from "@/components/dashboard/UserDashboard/Notifications";
import BookingTrendChart from "@/components/dashboard/charts/BookingTrendChart";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";

export default function UserDashboardPage() {
  return (
    <DashboardLayout defaultRole="user">
      <DashboardGreeting subtitle="Here's what's happening with your bookings and inquiries today." />

      {/* Stats Cards */}
      <div className="mb-5">
        <StatsCards />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Main Dashboard Grid */}
      <div className="space-y-6">
        {/* Top Row - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentBookings />
          <ActiveInquiries />
        </div>

        {/* Favorite Properties - Full Width */}
        <FavoriteProperties />

        {/* Middle Row - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <RecentPayments />
        </div>

        {/* Bottom Row - Chart Full Width */}
        <BookingTrendChart />
      </div>
    </DashboardLayout>
  );
}