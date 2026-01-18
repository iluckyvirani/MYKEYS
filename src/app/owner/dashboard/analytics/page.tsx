"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AnalyticsCharts from "@/components/dashboard/OwnerDashboard/Analytics/AnalyticsCharts";
import AnalyticsStats from "@/components/dashboard/OwnerDashboard/Analytics/AnalyticsStats";
import KeyMetrics from "@/components/dashboard/OwnerDashboard/Analytics/KeyMetrics";

export default function OwnerAnalyticsPage() {
  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Deep insights into your property performance and guest behavior
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Data updated: Today, 11:45 AM
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <AnalyticsStats />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Charts */}
        <div className="">
          <AnalyticsCharts />
        </div>

        {/* Right Column - Key Metrics */}
        <div>
          <KeyMetrics />
        </div>
      </div>
    </DashboardLayout>
  );
}