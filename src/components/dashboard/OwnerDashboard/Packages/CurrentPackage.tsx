"use client";

import { Crown, CheckCircle, Clock, Home, TrendingUp, HardDrive, Users, AlertCircle, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CurrentPackageProps {
  currentPackage: any;
  packageUsage: any;
  onRefresh: () => void;
}

export default function CurrentPackage({ currentPackage, packageUsage, onRefresh }: CurrentPackageProps) {
  if (!currentPackage || !packageUsage) {
    return (
      <Card className="p-8 text-center bg-linear-to-br from-gray-50 to-gray-100 border-dashed">
        <div className="max-w-md mx-auto">
          <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Package</h3>
          <p className="text-gray-600 text-sm mb-4">
            You don't have an active subscription. Choose a package below to get started.
          </p>
        </div>
      </Card>
    );
  }

  const { package: pkg } = currentPackage;
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const daysRemaining = Math.ceil(
    (new Date(packageUsage.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "BASIC":
        return { color: "bg-gray-100 text-gray-800", icon: Home };
      case "STANDARD":
        return { color: "bg-blue-100 text-blue-800", icon: Crown };
      case "PREMIUM":
        return { color: "bg-purple-100 text-purple-800", icon: Crown };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Home };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Active" };
      case "EXPIRED":
        return { color: "bg-red-100 text-red-800", icon: AlertCircle, label: "Expired" };
      case "CANCELLED":
        return { color: "bg-orange-100 text-orange-800", icon: AlertCircle, label: "Cancelled" };
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock, label: status };
    }
  };

  const tierConfig = getTierConfig(pkg.tier);
  const statusConfig = getStatusConfig(packageUsage.status);
  const TierIcon = tierConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-5">
      {/* Main Package Card */}
      <Card className="overflow-hidden">
        <div className="bg-linear-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <TierIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{pkg.name}</h2>
                <p className="text-green-100 text-sm capitalize">{pkg.tier} Tier</p>
              </div>
            </div>
            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(pkg.price)}</span>
            <span className="text-green-100">/ {pkg.duration}</span>
          </div>
        </div>

        <div className="p-6">
          {/* Subscription Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold text-gray-900">{formatDate(packageUsage.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Renewal Date</p>
                <p className="font-semibold text-gray-900">{formatDate(packageUsage.endDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="font-semibold text-gray-900">
                  {daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}
                </p>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Usage Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Properties Usage */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Properties</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {packageUsage.propertiesUsed} / {packageUsage.propertiesLimit}
                  </span>
                </div>
                <Progress
                  value={(packageUsage.propertiesUsed / packageUsage.propertiesLimit) * 100}
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {packageUsage.propertiesRemaining} remaining
                </p>
              </div>

              {/* Featured Listings Usage */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Featured Listings</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {packageUsage.featuredUsed} / {packageUsage.featuredLimit}
                  </span>
                </div>
                <Progress
                  value={
                    packageUsage.featuredLimit > 0
                      ? (packageUsage.featuredUsed / packageUsage.featuredLimit) * 100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {packageUsage.featuredRemaining} remaining
                </p>
              </div>

              {/* Storage Usage */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Storage</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {packageUsage.storageUsed.toFixed(1)} GB / {packageUsage.storageLimit} GB
                  </span>
                </div>
                <Progress value={packageUsage.storagePercentage} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  {packageUsage.storageRemaining.toFixed(1)} GB remaining
                </p>
              </div>

              {/* Leads Usage */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Total Leads</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {packageUsage.leadsUsedTotal} / {packageUsage.totalLeadsLimit}
                  </span>
                </div>
                <Progress
                  value={(packageUsage.leadsUsedTotal / packageUsage.totalLeadsLimit) * 100}
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {packageUsage.leadsRemaining} remaining
                </p>
              </div>
            </div>
          </div>

          {/* Features Included */}
          {pkg.featuresIncluded && pkg.featuresIncluded.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Features Included</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pkg.featuresIncluded.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-gray-700">{feature.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button onClick={onRefresh} variant="outline" className="rounded-[5px]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Warning if near limits */}
      {(packageUsage.propertiesRemaining <= 1 ||
        packageUsage.storagePercentage > 80 ||
        daysRemaining <= 7) && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-1">Action Required</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {packageUsage.propertiesRemaining <= 1 && (
                  <li>• You're running low on property slots ({packageUsage.propertiesRemaining} remaining)</li>
                )}
                {packageUsage.storagePercentage > 80 && (
                  <li>• Storage usage is high ({packageUsage.storagePercentage.toFixed(0)}% used)</li>
                )}
                {daysRemaining <= 7 && daysRemaining > 0 && (
                  <li>• Your subscription expires in {daysRemaining} days</li>
                )}
                {daysRemaining <= 0 && <li>• Your subscription has expired</li>}
              </ul>
              <p className="text-sm text-yellow-800 mt-2">
                Consider upgrading to a higher plan for more capacity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
