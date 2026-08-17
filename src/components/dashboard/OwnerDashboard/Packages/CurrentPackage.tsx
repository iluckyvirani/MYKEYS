"use client";

import { Crown, CheckCircle, Clock, Home, TrendingUp, AlertCircle, Calendar, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CurrentPackageProps {
  currentPackage: any;
  packageUsage: any;
  onRefresh: () => void;
  categoryLabel?: string;
}

export default function CurrentPackage({
  currentPackage,
  packageUsage,
  onRefresh,
  categoryLabel = "Rent",
}: CurrentPackageProps) {
  if (!currentPackage || !packageUsage) {
    return (
      <Card className="p-8 text-center bg-linear-to-br from-gray-50 to-gray-100 border-dashed">
        <div className="max-w-md mx-auto">
          <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active {categoryLabel} Package</h3>
          <p className="text-gray-600 text-sm mb-4">
            {categoryLabel === "Sale"
              ? "Choose a Sale package below to publish Buy listings."
              : "Choose a Rent package below to publish Long Rent listings."}
          </p>
        </div>
      </Card>
    );
  }

  const pkg = currentPackage;
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const daysRemaining = Math.ceil(
    (new Date(packageUsage.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

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

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case "days":
        return "day";
      case "months":
        return "month";
      case "years":
        return "year";
      default:
        return unit;
    }
  };

  const statusConfig = getStatusConfig(packageUsage.status);
  const StatusIcon = statusConfig.icon;
  const propertiesRemaining = Math.max(0, pkg.propertiesLimit - packageUsage.propertiesUsed);
  const featuredRemaining = Math.max(0, pkg.featuredLimit - packageUsage.featuredUsed);

  return (
    <div className="space-y-5">
      {/* Main Package Card */}
      <Card className="overflow-hidden">
        <div className="bg-linear-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{pkg.packageName}</h2>
                <p className="text-green-100 text-sm">
                  {categoryLabel} package ·{" "}
                  {categoryLabel === "Sale" ? "Buy listings" : "Long Rent listings"}
                </p>
              </div>
            </div>
            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatCurrency(pkg.price)}</span>
            <span className="text-green-100">/ {pkg.durationValue} {getUnitLabel(pkg.durationUnit)}</span>
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
                    {packageUsage.propertiesUsed} / {pkg.propertiesLimit}
                  </span>
                </div>
                <Progress
                  value={(packageUsage.propertiesUsed / pkg.propertiesLimit) * 100}
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {propertiesRemaining} remaining
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
                    {packageUsage.featuredUsed} / {pkg.featuredLimit}
                  </span>
                </div>
                <Progress
                  value={
                    pkg.featuredLimit > 0
                      ? (packageUsage.featuredUsed / pkg.featuredLimit) * 100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {featuredRemaining} remaining
                </p>
              </div>
            </div>
          </div>

          {/* Features Included */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Features Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {pkg.showOwnerName && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-gray-700">Show Owner Name</span>
                </div>
              )}
              {pkg.showOwnerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-gray-700">Show Owner Phone</span>
                </div>
              )}
              {pkg.directInquiryToOwner && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-gray-700">Direct Inquiry to Owner</span>
                </div>
              )}
              {pkg.adminCCOnInquiry && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-gray-700">Admin CC on Inquiry</span>
                </div>
              )}
              {pkg.fullAdminSupport && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-gray-700">Full Admin Support</span>
                </div>
              )}
              {pkg.docExpiryAlert && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-gray-700">Document Expiry Alerts</span>
                </div>
              )}
            </div>
          </div>

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
      {(propertiesRemaining <= 1 || daysRemaining <= 7) && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-1">Action Required</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {propertiesRemaining <= 1 && (
                  <li>• You're running low on property slots ({propertiesRemaining} remaining)</li>
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
