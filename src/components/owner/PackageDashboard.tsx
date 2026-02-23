"use client";

import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, Database, Zap, Badge, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface PackageUsage {
  ownerId: string;
  packageName: string;
  packageTier: string;
  activeSince: string;
  expiresAt: string;
  status: string;
  properties: {
    used: number;
    limit: number;
    percentage: number;
  };
  featured: {
    used: number;
    limit: number;
    percentage: number;
  };
  storage: {
    usedGB: number;
    limitGB: number;
    percentage: number;
  };
  leads: {
    usedToday: number;
    totalUsed: number;
    dailyLimit: number;
    totalLimit: number;
    dailyPercentage: number;
    totalPercentage: number;
  };
  verifiedBadge: {
    active: boolean;
    expiresAt: string | null;
  };
}

interface Props {
  onUpgrade?: () => void;
  onViewDetails?: () => void;
}

export default function PackageDashboard({ onUpgrade, onViewDetails }: Props) {
  const [usage, setUsage] = useState<PackageUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<PackageUsage>("/owner/packages/usage");
      if (response.data) {
        setUsage(response.data);
      }
    } catch (err) {
      setError("Failed to load package usage");
      console.error("Error fetching usage:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsage();
    setRefreshing(false);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-red-600";
    if (percentage >= 70) return "bg-yellow-600";
    return "bg-green-600";
  };

  const UsageCard = ({
    icon: Icon,
    label,
    used,
    limit,
    percentage,
    unit = "",
  }: {
    icon: any;
    label: string;
    used: number;
    limit: number;
    percentage: number;
    unit?: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <h4 className="font-semibold text-gray-900">{label}</h4>
        </div>
        <span className={`text-sm font-bold ${getUsageColor(percentage)}`}>{percentage}%</span>
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">
          {used}
          <span className="text-sm text-gray-600 ml-1">{unit}</span>
          <span className="text-gray-400"> / {limit}{unit}</span>
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressBarColor(percentage)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {percentage >= 90 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>Limit nearly reached</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !usage) {
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

  const daysRemaining = usage.expiresAt
    ? Math.ceil((new Date(usage.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">{usage.packageName} Plan</h2>
            <p className="text-green-100">
              Active since {new Date(usage.activeSince).toLocaleDateString()}
            </p>
            {daysRemaining && daysRemaining > 0 && (
              <p className="text-green-100 mt-1">
                {daysRemaining} days remaining until {new Date(usage.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm mb-2">Status</p>
            <div
              className={`inline-block px-4 py-2 rounded-full font-semibold ${
                usage.status === "ACTIVE"
                  ? "bg-green-500 text-green-900"
                  : "bg-yellow-500 text-yellow-900"
              }`}
            >
              {usage.status}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageCard
          icon={Users}
          label="Properties"
          used={usage.properties.used}
          limit={usage.properties.limit}
          percentage={usage.properties.percentage}
        />

        <UsageCard
          icon={Zap}
          label="Featured Listings"
          used={usage.featured.used}
          limit={usage.featured.limit}
          percentage={usage.featured.percentage}
        />

        <UsageCard
          icon={Database}
          label="Storage"
          used={Math.round(usage.storage.usedGB * 10) / 10}
          limit={usage.storage.limitGB}
          percentage={usage.storage.percentage}
          unit="GB"
        />

        <UsageCard
          icon={TrendingUp}
          label="Leads (Today)"
          used={usage.leads.usedToday}
          limit={usage.leads.dailyLimit}
          percentage={usage.leads.dailyPercentage}
        />
      </div>

      {/* Total Leads */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Total Leads (All Time)</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-700">
              {usage.leads.totalUsed} / {usage.leads.totalLimit} Leads Used
            </p>
            <span className="text-sm font-bold text-gray-900">{usage.leads.totalPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getProgressBarColor(usage.leads.totalPercentage)}`}
              style={{ width: `${Math.min(usage.leads.totalPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Verified Badge Status */}
      {usage.verifiedBadge.active && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Badge className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Verified Badge Active</h4>
              <p className="text-sm text-blue-700">
                Your account is verified and trusted by our platform
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Upgrade Suggestion */}
      {(usage.properties.percentage >= 80 ||
        usage.leads.dailyPercentage >= 80 ||
        usage.storage.percentage >= 80) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-900 text-sm">
            ⚡ You're reaching limits on your current plan. Consider upgrading to unlock more features and higher
            limits.
          </p>
        </div>
      )}
    </div>
  );
}
