// app/(user)/dashboard/page.tsx - Updated Version
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/UserDashboard/StatsCards";
import RecentBookings from "@/components/dashboard/UserDashboard/RecentBookings";
import ActiveInquiries from "@/components/dashboard/UserDashboard/ActiveInquiries";
import FavoriteProperties from "@/components/dashboard/UserDashboard/FavoriteProperties";
import UpcomingPayments from "@/components/dashboard/UserDashboard/UpcomingPayments";
import QuickActions from "@/components/dashboard/UserDashboard/QuickActions";
import Notifications from "@/components/dashboard/UserDashboard/Notifications";
import BookingTrendChart from "@/components/dashboard/charts/BookingTrendChart";

export default function UserDashboardPage() {
  return (
    <DashboardLayout defaultRole="user">
      {/* Welcome Section */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, John! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your bookings and inquiries today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-5">
        <StatsCards />
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 border border-red-900">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Recent Bookings */}
          <RecentBookings />

          {/* Active Inquiries */}
          <ActiveInquiries />

          {/* Favorite Properties */}
          <FavoriteProperties />
        </div>

        {/* Right Column */}
        <div className="space-y-8 col-span-2">
          {/* Upcoming Payments */}
          <UpcomingPayments />

          {/* Notifications */}
          <Notifications />

          {/* Booking Trend Chart */}
          <BookingTrendChart />
        </div>
      </div>
    </DashboardLayout>
  );
}