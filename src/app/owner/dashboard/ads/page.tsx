"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActiveCampaigns from "@/components/dashboard/OwnerDashboard/Ads/ActiveCampaigns";
import AdPerformance from "@/components/dashboard/OwnerDashboard/Ads/AdPerformance";
import AdsStats from "@/components/dashboard/OwnerDashboard/Ads/AdsStats";
import AdSuggestions from "@/components/dashboard/OwnerDashboard/Ads/AdSuggestions";
import BudgetOverview from "@/components/dashboard/OwnerDashboard/Ads/BudgetOverview";
import CreateAdCampaign from "@/components/dashboard/OwnerDashboard/Ads/CreateAdCampaign";


export default function OwnerAdsPage() {
  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ads & Promotions</h1>
            <p className="text-gray-600 mt-2">
              Manage property advertisements, track performance, and boost visibility
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Current Balance: £25,000 • Next Billing: Feb 1, 2024
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <AdsStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Campaigns */}
          <ActiveCampaigns />
          
          {/* Ad Performance */}
          <AdPerformance />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Budget Overview */}
          <BudgetOverview />
          
          {/* Create Ad Campaign */}
          <CreateAdCampaign />
          
          {/* Ad Suggestions */}
          <AdSuggestions />
        </div>
      </div>
    </DashboardLayout>
  );
}