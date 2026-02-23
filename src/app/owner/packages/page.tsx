"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PackageDashboard from "@/components/owner/PackageDashboard";
import PackageComparison from "@/components/owner/PackageComparison";
import SubscriptionModal from "@/components/owner/SubscriptionModal";

type PageView = "dashboard" | "comparison" | "faq";

export default function OwnerPackagesPage() {
  const [activeView, setActiveView] = useState<PageView>("dashboard");
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubscriptionSuccess = () => {
    setRefreshKey((k) => k + 1);
    setActiveView("dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="w-8 h-8 text-green-600" />
                Package Management
              </h1>
              <p className="text-gray-600 mt-2">View and manage your subscription plan</p>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                activeView === "dashboard"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Current Plan
            </button>
            <button
              onClick={() => setActiveView("comparison")}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                activeView === "comparison"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              All Plans
            </button>
            <button
              onClick={() => setActiveView("faq")}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                activeView === "faq"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "dashboard" && (
          <div key={refreshKey}>
            <PackageDashboard
              onUpgrade={() => setSubscriptionModalOpen(true)}
              onViewDetails={() => setActiveView("comparison")}
            />
          </div>
        )}

        {activeView === "comparison" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Compare All Plans</h2>
              <p className="text-gray-600">
                Choose the plan that best fits your business needs. Upgrade anytime.
              </p>
            </div>
            <PackageComparison
              onSelectPackage={() => {
                setSubscriptionModalOpen(true);
              }}
            />
          </div>
        )}

        {activeView === "faq" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What happens when I upgrade my plan?
                </h3>
                <p className="text-gray-700">
                  When you upgrade your plan, your current subscription is immediately cancelled and replaced with
                  the new plan. The new limits are active immediately, and you get pro-rata credits for the unused
                  portion of your previous plan.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Can I downgrade my plan?
                </h3>
                <p className="text-gray-700">
                  Yes, you can downgrade anytime. However, if you're using more resources than the lower tier allows
                  (e.g., 8 properties on a plan that allows 5), you'll need to reduce usage first before downgrading.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How are leads calculated?
                </h3>
                <p className="text-gray-700">
                  Leads are counted when someone submits an inquiry for your property. Daily leads reset at midnight
                  UTC. Total leads are cumulative and don't reset during your subscription. Once you reach the limit,
                  new inquiries are still recorded but marked as "queued" and you're notified to upgrade.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What does the verified badge do?
                </h3>
                <p className="text-gray-700">
                  The verified badge appears on your profile and all your listings, building trust with potential
                  buyers/renters. It increases visibility and click-through rates. Only STANDARD and PREMIUM plans
                  include the verified badge.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How much storage do I get?
                </h3>
                <p className="text-gray-700">
                  BASIC: 5GB, STANDARD: 50GB, PREMIUM: 200GB. Storage is used for images, documents, and videos.
                  Once you reach your limit, you'll need to delete content or upgrade to add more properties and
                  listings.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What's the difference between monthly and yearly billing?
                </h3>
                <p className="text-gray-700">
                  Yearly billing offers a 10% discount compared to monthly. Both options auto-renew at the end of the
                  billing period. You can manage or cancel your subscription anytime from your dashboard with no early
                  termination fees.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What support do I get?
                </h3>
                <p className="text-gray-700">
                  BASIC: Email support (48-hour response). STANDARD: Email + Chat support (24-hour response).
                  PREMIUM: 24/7 Priority support with dedicated account manager (1-hour response).
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Can I cancel my subscription?
                </h3>
                <p className="text-gray-700">
                  Yes, you can cancel anytime from your dashboard. Cancellation is effective immediately, and no
                  refunds are issued for partial months/years. You'll retain access until your billing period ends.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What if I need more properties than the PREMIUM plan?
                </h3>
                <p className="text-gray-700">
                  Contact our sales team for enterprise plans with custom limits. We can accommodate large portfolios
                  with dedicated support and custom integrations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
}
