"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Check, X, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface PackageUsage {
  ownerId: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  propertiesUsed: number;
  propertiesLimit: number;
  featuredUsed: number;
  featuredLimit: number;
  packageName: string;
  price: number;
  durationValue: number;
  durationUnit: string;
  showOwnerName: boolean;
  showOwnerPhone: boolean;
  directInquiryToOwner: boolean;
  adminCCOnInquiry: boolean;
  fullAdminSupport: boolean;
  docExpiryAlert: boolean;
}

interface Props {
  onUpgrade?: () => void;
  onViewDetails?: () => void;
}

export default function PackageDashboard({ onUpgrade, onViewDetails }: Props) {
  const [packageData, setPackageData] = useState<PackageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPackageData();
  }, []);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/owner/packages/usage");
      const payload = (response as any).data?.data ?? (response as any).data;
      const primary = payload?.RENT || payload?.SALE || null;
      if (primary) {
        setPackageData(primary);
      } else {
        setPackageData(null);
      }
    } catch (err) {
      setError("Failed to load package information");
      console.error("Error fetching package:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPackageData();
    setRefreshing(false);
  };

  const FeatureItem = ({ label, included }: { label: string; included: boolean }) => (
    <div className="flex items-center gap-3 py-2">
      <div className={`p-1 rounded ${included ? "bg-green-100" : "bg-gray-100"}`}>
        {included ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <X className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <span className={included ? "text-gray-900 font-medium" : "text-gray-500"}>{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 font-semibold">{error || "Failed to load package information"}</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">{packageData.packageName}</h2>
            <p className="text-green-100">
              Active since {new Date(packageData.startDate).toLocaleDateString()}
            </p>
            {packageData.daysRemaining > 0 && (
              <p className="text-green-100 mt-1">
                {packageData.daysRemaining} days remaining until {new Date(packageData.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm mb-2">Status</p>
            <div
              className={`inline-block px-4 py-2 rounded-full font-semibold ${
                packageData.status === "ACTIVE"
                  ? "bg-green-500 text-green-900"
                  : "bg-yellow-500 text-yellow-900"
              }`}
            >
              {packageData.status}
            </div>
          </div>
        </div>
      </div>

      {/* Price & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Price</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(packageData.price)}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Duration</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {packageData.durationValue}
            <span className="text-lg text-gray-600 ml-2">
              {packageData.durationUnit === "days" && "days"}
              {packageData.durationUnit === "months" && "months"}
              {packageData.durationUnit === "years" && "years"}
            </span>
          </p>
        </div>
      </div>

      {/* Properties & Featured Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
          <p className="text-2xl font-bold text-gray-900">
            {packageData.propertiesUsed} <span className="text-gray-500">/ {packageData.propertiesLimit}</span>
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-green-600"
              style={{ width: `${(packageData.propertiesUsed / packageData.propertiesLimit) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Featured Listings</h3>
          <p className="text-2xl font-bold text-gray-900">
            {packageData.featuredUsed} <span className="text-gray-500">/ {packageData.featuredLimit}</span>
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${packageData.featuredLimit > 0 ? (packageData.featuredUsed / packageData.featuredLimit) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Features Included</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureItem label="Show Owner Name" included={packageData.showOwnerName} />
          <FeatureItem label="Show Owner Phone" included={packageData.showOwnerPhone} />
          <FeatureItem label="Direct Inquiry to Owner" included={packageData.directInquiryToOwner} />
          <FeatureItem label="Admin CC on Inquiry" included={packageData.adminCCOnInquiry} />
          <FeatureItem label="Full Admin Support" included={packageData.fullAdminSupport} />
          <FeatureItem label="Document Expiry Alerts" included={packageData.docExpiryAlert} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onViewDetails}
          variant="outline"
          className="flex-1 py-2 border-gray-300 text-gray-900 hover:bg-gray-50"
        >
          View Full Details
        </Button>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex-1 py-2 border-gray-300 text-gray-900 hover:bg-gray-50"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
        <Button
          onClick={onUpgrade}
          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white"
        >
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
}
