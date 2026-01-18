"use client";

import { Crown, Check, Home, Star, Zap, Globe, Shield, Users, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const packages = [
  {
    id: "basic",
    name: "Basic",
    price: 1999,
    billing: "monthly",
    recommended: false,
    popular: false,
    features: [
      { name: "Up to 3 Properties", included: true },
      { name: "Basic Analytics", included: true },
      { name: "Email Support", included: true },
      { name: "Standard Listing", included: true },
      { name: "5 GB Storage", included: true },
      { name: "Featured Listings", included: false },
      { name: "Priority Support", included: false },
      { name: "Advanced Analytics", included: false },
      { name: "Custom Domain", included: false },
      { name: "API Access", included: false },
    ],
    limits: {
      properties: 3,
      bookings: "Unlimited",
      storage: "5 GB",
      support: "Email",
      featured: 0,
    },
    color: "gray",
  },
  {
    id: "professional",
    name: "Professional",
    price: 4999,
    billing: "monthly",
    recommended: true,
    popular: true,
    features: [
      { name: "Up to 10 Properties", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Priority Support", included: true },
      { name: "Featured Listings (2)", included: true },
      { name: "25 GB Storage", included: true },
      { name: "Custom Domain", included: true },
      { name: "API Access", included: true },
      { name: "Team Members (3)", included: true },
      { name: "Marketing Tools", included: false },
      { name: "Dedicated Manager", included: false },
    ],
    limits: {
      properties: 10,
      bookings: "Unlimited",
      storage: "25 GB",
      support: "Priority",
      featured: 2,
    },
    color: "blue",
  },
  {
    id: "premium",
    name: "Premium",
    price: 9999,
    billing: "monthly",
    recommended: false,
    popular: false,
    features: [
      { name: "Up to 25 Properties", included: true },
      { name: "Premium Analytics", included: true },
      { name: "24/7 Phone Support", included: true },
      { name: "Featured Listings (5)", included: true },
      { name: "100 GB Storage", included: true },
      { name: "Custom Domain", included: true },
      { name: "Full API Access", included: true },
      { name: "Team Members (10)", included: true },
      { name: "Marketing Tools", included: true },
      { name: "Dedicated Manager", included: true },
    ],
    limits: {
      properties: 25,
      bookings: "Unlimited",
      storage: "100 GB",
      support: "24/7 Phone",
      featured: 5,
    },
    color: "purple",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 24999,
    billing: "monthly",
    recommended: false,
    popular: false,
    features: [
      { name: "Unlimited Properties", included: true },
      { name: "Enterprise Analytics", included: true },
      { name: "Dedicated Support", included: true },
      { name: "All Listings Featured", included: true },
      { name: "Unlimited Storage", included: true },
      { name: "Multiple Domains", included: true },
      { name: "Custom API", included: true },
      { name: "Unlimited Team", included: true },
      { name: "Full Marketing Suite", included: true },
      { name: "Account Manager", included: true },
    ],
    limits: {
      properties: "Unlimited",
      bookings: "Unlimited",
      storage: "Unlimited",
      support: "Dedicated",
      featured: "All",
    },
    color: "green",
  },
];

const getPackageColor = (color: string) => {
  switch (color) {
    case "gray":
      return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
    case "blue":
      return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
    case "purple":
      return { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" };
    case "green":
      return { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
  }
};

export default function AvailablePackages() {
  const [selectedPackage, setSelectedPackage] = useState("professional");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleUpgrade = () => {
    const selected = packages.find(p => p.id === selectedPackage);
    alert(`Upgrading to ${selected?.name} plan at ₹${selected?.price.toLocaleString()}/${billingCycle}`);
  };

  const calculateYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount for yearly
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Available Packages</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose the perfect plan for your business needs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 text-sm rounded-[5px] ${billingCycle === "monthly" ? "bg-white shadow" : ""}`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-[5px] ${billingCycle === "yearly" ? "bg-white shadow" : ""}`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {packages.map((pkg) => {
          const colorConfig = getPackageColor(pkg.color);
          const isSelected = selectedPackage === pkg.id;
          const price = billingCycle === "yearly" ? calculateYearlyPrice(pkg.price) : pkg.price;

          return (
            <div
              key={pkg.id}
              className={`border rounded-lg p-6 relative transition-all ${
                isSelected
                  ? `ring-2 ring-green-500 border-green-500 transform scale-[1.02]`
                  : "hover:border-gray-400"
              } ${pkg.recommended ? "border-green-300" : ""}`}
              onClick={() => handleSelectPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 mb-3 ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
                  {pkg.id === "premium" || pkg.id === "enterprise" ? (
                    <Crown className="w-4 h-4" />
                  ) : pkg.id === "professional" ? (
                    <Star className="w-4 h-4" />
                  ) : (
                    <Home className="w-4 h-4" />
                  )}
                  {pkg.name}
                </div>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{price.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/{billingCycle}</span>
                </div>
                
                {billingCycle === "yearly" && (
                  <div className="text-sm text-green-600">
                    Save ₹{(pkg.price * 12 - price).toLocaleString()} yearly
                  </div>
                )}
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium">{pkg.limits.properties}</div>
                  <div className="text-xs text-gray-600">Properties</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium">{pkg.limits.featured}</div>
                  <div className="text-xs text-gray-600">Featured</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium">{pkg.limits.storage}</div>
                  <div className="text-xs text-gray-600">Storage</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium">{pkg.limits.support}</div>
                  <div className="text-xs text-gray-600">Support</div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-6">
                {pkg.features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                    )}
                    <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  isSelected
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                {isSelected ? "Selected" : "Select Plan"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Upgrade Button */}
      <div className="border-t pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-medium text-gray-900 mb-1">
              Selected: {packages.find(p => p.id === selectedPackage)?.name} Plan
            </div>
            <div className="text-sm text-gray-600">
              {billingCycle === "yearly" ? "Billed annually" : "Billed monthly"} • Cancel anytime
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₹{(billingCycle === "yearly" 
                  ? calculateYearlyPrice(packages.find(p => p.id === selectedPackage)?.price || 0)
                  : packages.find(p => p.id === selectedPackage)?.price
                )?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">/{billingCycle}</div>
            </div>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
              size="lg"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}