// app/service/dashboard/page.tsx - Service Dashboard Main Page
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/ServiceDashboard/StatsCards";
import RecentBookings from "@/components/dashboard/ServiceDashboard/RecentBookings";
import ServiceRequests from "@/components/dashboard/ServiceDashboard/ServiceRequests";
import EarningsChart from "@/components/dashboard/ServiceDashboard/EarningsChart";
import ReviewsCard from "@/components/dashboard/ServiceDashboard/ReviewsCard";
import QuickActions from "@/components/dashboard/ServiceDashboard/QuickActions";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";

export default function ServiceDashboardPage() {
  return (
    <DashboardLayout defaultRole="service">
      <DashboardGreeting subtitle="Here's your service performance overview and recent bookings." />

      {/* Stats Cards */}
      <div className="mb-6">
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
          <ServiceRequests />
        </div>

        {/* Earnings Chart - Full Width */}
        <EarningsChart />

        {/* Reviews - Full Width */}
        <ReviewsCard />

        <DynamicFAQSection
          categories={["SERVICE"]}
          limit={4}
          compact
          showViewAll
          viewAllHref="/faq?category=SERVICE"
          title="Service Provider FAQs"
        />
      </div>
    </DashboardLayout>
  );
}
