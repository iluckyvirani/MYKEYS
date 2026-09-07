"use client";

import { useEffect, useState } from "react";
import { Check, X, Zap, Badge, Database, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
interface Package {
  id: string;
  tier: string;
  name: string;
  price: number;
  duration: string;
  propertyLimit: number;
  featuredLimit: number;
  storageLimit: number;
  dailyLeadsLimit: number;
  totalLeadsLimit: number;
  hasVerifiedBadge: boolean;
  supportLevel: string;
  featuresIncluded: string[];
}

interface Props {
  onSelectPackage?: (packageId: string, duration: "monthly" | "yearly") => void;
  currentPackageTier?: string;
}

export default function PackageComparison({ onSelectPackage, currentPackageTier }: Props) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get<Package[]>("/packages");
      if (response.data) {
        setPackages(response.data);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureLabel = (feature: string): string => {
    const labels: Record<string, string> = {
      API_ACCESS: "API Access",
      CUSTOM_DOMAIN: "Custom Domain",
      ADVANCED_ANALYTICS: "Advanced Analytics",
      BULK_UPLOAD: "Bulk Upload",
      PRIORITY_SUPPORT: "Priority Support",
      VERIFIED_BADGE: "Verified Badge",
      FEATURED_LISTINGS: "Featured Listings",
      LEAD_CAPTURE: "Lead Capture",
    };
    return labels[feature] || feature;
  };

  const priceWithDuration = (basePrice: number): number => {
    if (selectedDuration === "yearly") {
      return basePrice * 12 * 0.9; // 10% discount for yearly
    }
    return basePrice;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Duration Toggle */}
      <div className="flex justify-center items-center gap-4">
        <span className={`text-sm font-medium ${selectedDuration === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
          Monthly
        </span>
        <button
          onClick={() => setSelectedDuration(selectedDuration === "monthly" ? "yearly" : "monthly")}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
            selectedDuration === "yearly" ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              selectedDuration === "yearly" ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${selectedDuration === "yearly" ? "text-gray-900" : "text-gray-500"}`}>
          Yearly
        </span>
        {selectedDuration === "yearly" && (
          <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
            Save 10%
          </span>
        )}
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative rounded-lg border-2 transition-all ${
              currentPackageTier === pkg.tier
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-green-400"
            } overflow-hidden`}
          >
            {/* Current Badge */}
            {currentPackageTier === pkg.tier && (
              <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                CURRENT
              </div>
            )}

            {/* Package Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
              <div className="mt-2">
                {pkg.price === 0 ? (
                  <p className="text-2xl font-bold text-green-600">Free</p>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${Math.round(priceWithDuration(pkg.price))}
                    </p>
                    <p className="text-sm text-gray-600">
                      per {selectedDuration === "monthly" ? "month" : "year"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Package Content */}
            <div className="p-6 space-y-6">
              {/* Key Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Key Features</h4>

                {/* Properties */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pkg.propertyLimit} Properties</p>
                    <p className="text-xs text-gray-500">Can list</p>
                  </div>
                </div>

                {/* Storage */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pkg.storageLimit} GB Storage</p>
                    <p className="text-xs text-gray-500">Total available</p>
                  </div>
                </div>

                {/* Featured */}
                {pkg.featuredLimit > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pkg.featuredLimit} Featured</p>
                      <p className="text-xs text-gray-500">Premium listings</p>
                    </div>
                  </div>
                )}

                {/* Leads */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pkg.dailyLeadsLimit}/{pkg.totalLeadsLimit} Leads
                    </p>
                    <p className="text-xs text-gray-500">Daily/Total</p>
                  </div>
                </div>

                {/* Verified Badge */}
                {pkg.hasVerifiedBadge && (
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                    <Badge className="w-5 h-5 text-sky-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Verified Badge</p>
                      <p className="text-xs text-gray-500">Builds trust</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Features */}
              {pkg.featuresIncluded.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-3">Included Features</h4>
                  <ul className="space-y-2">
                    {pkg.featuresIncluded.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />
                        {getFeatureLabel(feature)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Support Level */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold capitalize">{pkg.supportLevel}</span> Support
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => onSelectPackage?.(pkg.id, selectedDuration)}
                disabled={currentPackageTier === pkg.tier}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  currentPackageTier === pkg.tier
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {currentPackageTier === pkg.tier ? "Current Plan" : `Get ${pkg.name}`}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                {packages.map((pkg) => (
                  <th key={pkg.id} className="text-center py-4 px-4 font-semibold text-gray-900">
                    {pkg.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Properties */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-700">Properties Limit</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-4 px-4 text-gray-900 font-medium">
                    {pkg.propertyLimit}
                  </td>
                ))}
              </tr>

              {/* Featured */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-700">Featured Listings</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-4 px-4 text-gray-900">
                    {pkg.featuredLimit > 0 ? pkg.featuredLimit : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                  </td>
                ))}
              </tr>

              {/* Storage */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-700">Storage</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-4 px-4 text-gray-900 font-medium">
                    {pkg.storageLimit} GB
                  </td>
                ))}
              </tr>

              {/* Leads */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-700">Daily Leads</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-4 px-4 text-gray-900 font-medium">
                    {pkg.dailyLeadsLimit}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-700">Total Leads</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-4 px-4 text-gray-900 font-medium">
                    {pkg.totalLeadsLimit}
                  </td>
                ))}
              </tr>

              {/* Support */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-700">Support Level</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-4 px-4 text-gray-900 font-medium capitalize">
                    {pkg.supportLevel}
                  </td>
                ))}
              </tr>

              {/* Verified Badge */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-gray-700">Verified Badge</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-4 px-4">
                    {pkg.hasVerifiedBadge ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
