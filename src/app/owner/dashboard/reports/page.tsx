"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ReportGenerator from "@/components/dashboard/OwnerDashboard/Reports/ReportGenerator";
import ReportsStats from "@/components/dashboard/OwnerDashboard/Reports/ReportsStats";
import SavedReports from "@/components/dashboard/OwnerDashboard/Reports/SavedReports";


export default function OwnerReportsPage() {
  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">
              Generate detailed reports and analyze property performance
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last report generated: Today, 10:30 AM
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <ReportsStats />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Report Generator */}
        <div className="">
          <ReportGenerator />
        </div>

        {/* Right Column - Saved Reports */}
        <div>
          <SavedReports />
        </div>
      </div>
    </DashboardLayout>
  );
}