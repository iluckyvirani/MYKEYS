"use client";

import { Crown, CheckCircle, Clock, AlertCircle, Calendar, ArrowUpRight, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const currentPlan = {
  name: "Professional Plan",
  tier: "professional",
  price: 4999,
  billing: "monthly",
  status: "active", // active, expired, pending, cancelled
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  nextBilling: "2024-02-01",
  autoRenew: true,
  features: [
    "Up to 10 Properties",
    "Unlimited Bookings",
    "Advanced Analytics",
    "Priority Support",
    "Featured Listings (2)",
    "Custom Domain",
  ],
  usage: {
    properties: 5,
    propertyLimit: 10,
    featuredListings: 2,
    featuredLimit: 2,
    storage: 8.5,
    storageLimit: 25, // GB
  },
  benefits: [
    "72% occupancy rate",
    "£2,45,000 monthly revenue",
    "42% repeat guests",
  ],
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "basic":
      return "bg-gray-100 text-gray-800";
    case "professional":
      return "bg-blue-100 text-blue-800";
    case "premium":
      return "bg-purple-100 text-purple-800";
    case "enterprise":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTierBadge = (tier: string) => {
  switch (tier) {
    case "basic":
      return { label: "Basic", icon: Home };
    case "professional":
      return { label: "Professional", icon: Crown };
    case "premium":
      return { label: "Premium", icon: Crown };
    case "enterprise":
      return { label: "Enterprise", icon: Crown };
    default:
      return { label: "Basic", icon: Home };
  }
};

export default function CurrentPlan() {
  const [autoRenew, setAutoRenew] = useState(currentPlan.autoRenew);

  const daysRemaining = Math.ceil(
    (new Date(currentPlan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const toggleAutoRenew = () => {
    setAutoRenew(!autoRenew);
    alert(`Auto-renew ${!autoRenew ? "enabled" : "disabled"}`);
  };

  const cancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your subscription? Your plan will remain active until the end of the billing period.")) {
      alert("Subscription cancellation requested. You'll continue to have access until " + currentPlan.endDate);
    }
  };

  const upgradePlan = () => {
    alert("Redirecting to plan upgrade...");
  };

  const tierBadge = getTierBadge(currentPlan.tier);
  const BadgeIcon = tierBadge.icon;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[5px] border border-blue-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Plan Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${getTierColor(currentPlan.tier)}`}>
              <BadgeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{currentPlan.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(currentPlan.tier)}`}>
                  {tierBadge.label}
                </span>
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900">
              £{currentPlan.price.toLocaleString()}
              <span className="text-lg text-gray-600">/{currentPlan.billing}</span>
            </div>
            <div className="text-sm text-gray-600">
              Next billing: {new Date(currentPlan.nextBilling).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-white/50 rounded-lg">
              <div className="text-sm text-gray-600">Properties</div>
              <div className="text-lg font-bold">
                {currentPlan.usage.properties}/{currentPlan.usage.propertyLimit}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{ width: `${(currentPlan.usage.properties / currentPlan.usage.propertyLimit) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <div className="text-sm text-gray-600">Featured</div>
              <div className="text-lg font-bold">
                {currentPlan.usage.featuredListings}/{currentPlan.usage.featuredLimit}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full bg-purple-500"
                  style={{ width: `${(currentPlan.usage.featuredListings / currentPlan.usage.featuredLimit) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <div className="text-sm text-gray-600">Storage</div>
              <div className="text-lg font-bold">
                {currentPlan.usage.storage}/{currentPlan.usage.storageLimit}GB
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full bg-green-500"
                  style={{ width: `${(currentPlan.usage.storage / currentPlan.usage.storageLimit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="lg:w-96 space-y-4">
          {/* Status Card */}
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Plan Status</span>
              </div>
              <div className="flex items-center gap-1 text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{daysRemaining} days remaining</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Valid until {new Date(currentPlan.endDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Auto-renewal</span>
              <button
                onClick={toggleAutoRenew}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  autoRenew ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    autoRenew ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              {currentPlan.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={upgradePlan}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button
              variant="outline"
              onClick={cancelSubscription}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Cancel Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}