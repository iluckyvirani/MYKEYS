"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AvailablePackages from "@/components/dashboard/OwnerDashboard/Packages/AvailablePackages";
import CurrentPlan from "@/components/dashboard/OwnerDashboard/Packages/CurrentPlan";
import PackageFeatures from "@/components/dashboard/OwnerDashboard/Packages/PackageFeatures";
import PackageHistory from "@/components/dashboard/OwnerDashboard/Packages/PackageHistory";


export default function OwnerPackagesPage() {
  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packages & Pricing</h1>
            <p className="text-gray-600 mt-2">
              Choose the perfect plan for your property management needs
            </p>
          </div>
          <div className="text-sm text-gray-500">
            All plans include 24/7 support and basic features
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <div className="mb-6">
        <CurrentPlan />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column */}
        <div className=" space-y-6">
          {/* Available Packages */}
          <AvailablePackages />
          
          {/* Package History */}
          <PackageHistory />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Package Features */}
          <PackageFeatures />
        </div>
      </div>
    </DashboardLayout>
  );
}