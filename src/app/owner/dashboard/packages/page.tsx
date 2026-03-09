"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import CurrentPackage from "@/components/dashboard/OwnerDashboard/Packages/CurrentPackage";
import AvailablePackages from "@/components/dashboard/OwnerDashboard/Packages/AvailablePackages";
import PackageHistory from "@/components/dashboard/OwnerDashboard/Packages/PackageHistory";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerPackagesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [packageUsage, setPackageUsage] = useState<any>(null);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [currentPkgRes, usageRes, availablePkgsRes] = await Promise.all([
          api.get("/owner/packages"),
          api.get("/owner/packages/usage"),
          api.get("/packages")
        ]);

        setCurrentPackage(currentPkgRes.data?.data || null);
        setPackageUsage(usageRes.data?.data || null);
        setAvailablePackages(availablePkgsRes.data?.data || []);
      } catch (err: any) {
        console.error("Error fetching package data:", err);
        setError(err.response?.data?.error || "Failed to load package information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading your package information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Failed to load packages</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={handleRefresh}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packages & Pricing</h1>
            <p className="text-gray-600 mt-2">
              Manage your subscription and explore upgrade options
            </p>
          </div>
        </div>
      </div>

      {/* Current Package */}
      <div className="mb-6">
        <CurrentPackage 
          currentPackage={currentPackage} 
          packageUsage={packageUsage} 
          onRefresh={handleRefresh}
        />
      </div>

      {/* Available Packages */}
      <div className="mb-6">
        <AvailablePackages 
          packages={availablePackages} 
          currentTier={currentPackage?.package?.tier || null}
          onSubscribe={handleRefresh}
        />
      </div>

      {/* Package History */}
      <div>
        <PackageHistory />
      </div>
    </DashboardLayout>
  );
}