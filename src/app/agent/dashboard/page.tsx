// app/(owner)/dashboard/page.tsx - Final Version
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OwnerStatsCards from "@/components/dashboard/OwnerDashboard/OwnerStatsCards";
import PropertyList from "@/components/dashboard/OwnerDashboard/PropertyList";
import BookingCalendar from "@/components/dashboard/OwnerDashboard/BookingCalendar";
import InquiryInbox from "@/components/dashboard/OwnerDashboard/InquiryInbox";
import RevenueChart from "@/components/dashboard/OwnerDashboard/RevenueChart";
import QuickActions from "@/components/dashboard/OwnerDashboard/QuickActions";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";

export default function AgentDashboardPage() {
  return (
    <DashboardLayout defaultRole="agent">
      <DashboardGreeting subtitle="Manage your properties, bookings, and inquiries from one place." />

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

        <DynamicFAQSection
          categories={["AGENT"]}
          limit={4}
          compact
          showViewAll
          viewAllHref="/faq?category=AGENT"
          title="Agent Help & FAQs"
        />
      </div>
    </DashboardLayout>
  );
}