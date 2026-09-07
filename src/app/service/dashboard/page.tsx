// app/service/dashboard/page.tsx - Service Dashboard Main Page
"use client";

import { Component, ReactNode } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/ServiceDashboard/StatsCards";
import RecentBookings from "@/components/dashboard/ServiceDashboard/RecentBookings";
import ServiceRequests from "@/components/dashboard/ServiceDashboard/ServiceRequests";
import EarningsChart from "@/components/dashboard/ServiceDashboard/EarningsChart";
import ReviewsCard from "@/components/dashboard/ServiceDashboard/ReviewsCard";
import QuickActions from "@/components/dashboard/ServiceDashboard/QuickActions";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";

class SectionGuard extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-lg border border-gray-100 p-5 text-center text-sm text-gray-500">
          This section could not be loaded. Refresh to try again.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ServiceDashboardPage() {
  return (
    <DashboardLayout defaultRole="service">
      <DashboardGreeting subtitle="Here's your service performance overview and recent bookings." />

      {/* Stats Cards */}
      <div className="mb-6">
        <SectionGuard>
          <StatsCards />
        </SectionGuard>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Main Dashboard Grid */}
      <div className="space-y-6">
        {/* Top Row - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionGuard>
            <RecentBookings />
          </SectionGuard>
          <SectionGuard>
            <ServiceRequests />
          </SectionGuard>
        </div>

        {/* Earnings Chart - Full Width */}
        <SectionGuard>
          <EarningsChart />
        </SectionGuard>

        {/* Reviews - Full Width */}
        <SectionGuard>
          <ReviewsCard />
        </SectionGuard>

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
