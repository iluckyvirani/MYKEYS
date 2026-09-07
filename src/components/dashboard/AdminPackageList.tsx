"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  Check,
  Users,
  Database,
  Zap,
  Star,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PackageData {
  id: string;
  name: string;
  tier: string;
  price: number;
  duration: string;
  propertyLimit: number;
  featuredLimit: number;
  storageLimit: number;
  dailyLeadsLimit: number;
  isActive: boolean;
  subscribers: number;
  supportLevel: string;
}

interface AdminPackageListProps {
  packages: PackageData[];
  viewMode: "grid" | "list";
  onView: (pkg: PackageData) => void;
  onEdit: (pkg: PackageData) => void;
  onDelete: (id: string) => void;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case "BASIC":
      return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" };
    case "STANDARD":
      return { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" };
    case "PREMIUM":
      return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" };
    default:
      return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" };
  }
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "BASIC":
      return "⭐";
    case "STANDARD":
      return "⭐⭐";
    case "PREMIUM":
      return "⭐⭐⭐";
    default:
      return "";
  }
};

export default function AdminPackageList({
  packages,
  viewMode,
  onView,
  onEdit,
  onDelete,
}: AdminPackageListProps) {
  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const colors = getTierColor(pkg.tier);
          const isPremium = pkg.tier === "PREMIUM";

          return (
            <Card
              key={pkg.id}
              className={`overflow-hidden rounded-[5px] transition-all hover:shadow-xl ${
                isPremium
                  ? "border-2 border-amber-400 relative"
                  : `border-2 ${colors.border} hover:border-green-500`
              }`}
            >
              {/* Premium Badge */}
              {isPremium && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 rounded-full p-2">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              )}

              <div className={`${colors.bg} p-6`}>
                {/* Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {pkg.name}
                    </h3>
                    {pkg.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </div>
                  <Badge className={`${colors.badge}`}>{pkg.tier}</Badge>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className={`text-4xl font-bold ${colors.text}`}>
                    {formatCurrency(pkg.price)}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">per {pkg.duration}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {pkg.propertyLimit} Properties
                      </p>
                      <p className="text-gray-600 text-xs">List multiple properties</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {pkg.featuredLimit} Featured
                      </p>
                      <p className="text-gray-600 text-xs">Featured listings priority</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {pkg.storageLimit}GB Storage
                      </p>
                      <p className="text-gray-600 text-xs">Cloud storage capacity</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {pkg.dailyLeadsLimit} Daily Leads
                      </p>
                      <p className="text-gray-600 text-xs">Maximum leads per day</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-white/60 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Subscribers</p>
                    <p className="text-xl font-bold text-gray-900">
                      {pkg.subscribers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Support</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">
                      {pkg.supportLevel}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-[5px] hover:bg-green-50"
                    onClick={() => onView(pkg)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-[5px]"
                      >
                        ⋯
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(pkg)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={() => onDelete(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-3">
      {packages.map((pkg) => {
        const colors = getTierColor(pkg.tier);

        return (
          <div
            key={pkg.id}
            className={`flex items-center justify-between p-4 border rounded-[5px] hover:bg-gray-50 transition-colors ${colors.border}`}
          >
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={colors.badge}>{pkg.tier}</Badge>
                    {pkg.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-8 px-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Price</p>
                <p className="font-bold text-gray-900">{formatCurrency(pkg.price)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Properties</p>
                <p className="font-bold text-gray-900">{pkg.propertyLimit}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Subscribers</p>
                <p className="font-bold text-gray-900">{pkg.subscribers}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Storage</p>
                <p className="font-bold text-gray-900">{pkg.storageLimit}GB</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0 ml-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-[5px]"
                onClick={() => onView(pkg)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-[5px]"
                  >
                    ⋯
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(pkg)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => onDelete(pkg.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
