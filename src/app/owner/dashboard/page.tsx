// app/(owner)/dashboard/page.tsx - Final Version
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OwnerStatsCards from "@/components/dashboard/OwnerDashboard/OwnerStatsCards";
import PropertyList from "@/components/dashboard/OwnerDashboard/PropertyList";
import BookingCalendar from "@/components/dashboard/OwnerDashboard/BookingCalendar";
import InquiryInbox from "@/components/dashboard/OwnerDashboard/InquiryInbox";
import RevenueChart from "@/components/dashboard/OwnerDashboard/RevenueChart";
import QuickActions from "@/components/dashboard/OwnerDashboard/QuickActions";

export default function OwnerDashboardPage() {
  return (
    <DashboardLayout defaultRole="owner">
      {/* Welcome Section */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Owner Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your properties, bookings, and inquiries from one place.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: Today, 10:30 AM
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-5">
        <OwnerStatsCards />
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Property List */}
        <PropertyList />

        {/* Calendar and Inquiries */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-5"> */}
          <BookingCalendar />
          <InquiryInbox />
        {/* </div> */}

        {/* Revenue Analytics */}
        <RevenueChart />
      </div>
    </DashboardLayout>
  );
}