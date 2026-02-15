"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Loader,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Home,
  Star,
  Grid,
  List as ListIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  propertyPrice?: number;
  priceType: string;
  propertyType: string;
  listingType: string;
  rentalType?: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  status: string;
  images: Array<{ url: string; isPrimary: boolean }>;
  amenities: any[];
  averageRating?: number;
  reviewCount?: number;
  occupancy?: number;
  revenue?: number;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  totalRevenue: number;
  averageRating: number;
}

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch properties from API
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("pageSize", "100");

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get(`/properties?${params.toString()}`);

      if (response.data.success) {
        const allProperties = response.data.data.items || [];
        setProperties(allProperties);

        // Calculate stats
        const activeProps = allProperties.filter(
          (p: Property) => p.status === "ACTIVE"
        ).length;
        const totalRev = allProperties.reduce(
          (sum: number, p: Property) => sum + (p.revenue || 0),
          0
        );
        const avgRating =
          allProperties.length > 0
            ? allProperties.reduce(
              (sum: number, p: Property) => sum + (p.averageRating || 0),
              0
            ) / allProperties.length
            : 0;

        setStats({
          total: allProperties.length,
          active: activeProps,
          inactive: allProperties.length - activeProps,
          totalRevenue: totalRev,
          averageRating: Math.round(avgRating * 10) / 10,
        });
      }
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(
        err.response?.data?.message || "Failed to fetch properties"
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch properties on mount and when search changes
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Delete property
  const handleDelete = async (propertyId: string) => {
    try {
      setDeleting(true);

      const response = await api.delete(`/api/properties/${propertyId}`);

      if (response.data.success) {
        // Remove from local state
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        setDeleteConfirm(null);

        // Refresh stats
        await fetchProperties();
      }
    } catch (err: any) {
      console.error("Error deleting property:", err);
      alert(err.response?.data?.message || "Failed to delete property");
    } finally {
      setDeleting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DRAFT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get listing type badge
  const getListingBadge = (listingType: string, rentalType?: string) => {
    if (listingType === "BUY") {
      return {
        text: "For Sale",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      };
    }
    if (rentalType === "SHORT_TERM") {
      return {
        text: "Short Stay",
        color: "bg-green-100 text-green-800 border-green-200",
      };
    }
    if (rentalType === "LONG_TERM") {
      return {
        text: "Long Term",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    }
    return {
      text: "For Rent",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    };
  };

  const primaryImage = (prop: Property) =>
    prop.images.find((img) => img.isPrimary)?.url || prop.images[0]?.url || "";

  return (
    <DashboardLayout defaultRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600 mt-2">
                Manage and view all your property listings
              </p>
            </div>
            <Button
              asChild
              className="gap-2 bg-green-600 hover:bg-green-700 w-fit"
            >
              <Link href="/owner/dashboard/properties/add">
                <Plus className="w-4 h-4" />
                Add New Property
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600">
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.active}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Inactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.inactive}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-600">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-600">
                  Avg Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.averageRating}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Properties</CardTitle>
                <CardDescription>
                  {properties.length} properties total
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <ListIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search properties by title or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[5px] flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900">Error</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 text-green-600 animate-spin" />
                <p className="text-gray-600 mt-3">Loading properties...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && properties.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Try a different search"
                    : "Get started by adding your first property"}
                </p>
                <Button
                  asChild
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Link href="/owner/dashboard/properties/add">
                    <Plus className="w-4 h-4" />
                    Add Property
                  </Link>
                </Button>
              </div>
            )}

            {/* Grid View */}
            {!loading && properties.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => {
                  const listingBadge = getListingBadge(
                    property.listingType,
                    property.rentalType
                  );
                  const price =
                    property.listingType === "BUY"
                      ? property.propertyPrice
                      : property.price;

                  return (
                    <Card
                      key={property.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {primaryImage(property) && (
                          <img
                            src={primaryImage(property)}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={`border ${listingBadge.color}`}
                            variant="secondary"
                          >
                            {listingBadge.text}
                          </Badge>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={`border ${getStatusColor(property.status)}`}
                            variant="secondary"
                          >
                            {property.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {property.title}
                        </h3>

                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {property.address},{property.city}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-200">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {property.bedrooms}
                            </div>
                            <div className="text-xs text-gray-600">Beds</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {property.bathrooms}
                            </div>
                            <div className="text-xs text-gray-600">Baths</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {property.guests}
                            </div>
                            <div className="text-xs text-gray-600">Guests</div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-gray-900">
                              {formatCurrency(price || 0)}
                            </span>
                          </div>
                          {property.averageRating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium">
                                {property.averageRating}
                              </span>
                              <span className="text-gray-500">
                                ({property.reviewCount})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <Link
                              href={`/owner/dashboard/properties/${property.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                ⋯
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/owner/dashboard/properties/${property.id}/edit`}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => setDeleteConfirm(property.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {!loading && properties.length > 0 && viewMode === "list" && (
              <div className="space-y-3">
                {properties.map((property) => {
                  const listingBadge = getListingBadge(
                    property.listingType,
                    property.rentalType
                  );
                  const price =
                    property.listingType === "BUY"
                      ? property.propertyPrice
                      : property.price;

                  return (
                    <div
                      key={property.id}
                      className="flex items-center gap-4 p-4 border rounded-[5px] hover:bg-gray-50 transition-colors"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {primaryImage(property) && (
                          <img
                            src={primaryImage(property)}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {property.city}, {property.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`border ${getStatusColor(property.status)}`}
                            variant="secondary"
                          >
                            {property.status}
                          </Badge>
                          <Badge
                            className={`border ${listingBadge.color}`}
                            variant="secondary"
                          >
                            {listingBadge.text}
                          </Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 px-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Beds</div>
                          <div className="font-semibold text-gray-900">
                            {property.bedrooms}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Baths</div>
                          <div className="font-semibold text-gray-900">
                            {property.bathrooms}
                          </div>
                        </div>
                        {property.averageRating && (
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Rating</div>
                            <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              {property.averageRating}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="hidden sm:block text-right">
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="font-bold text-gray-900">
                          {formatCurrency(price || 0)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link
                            href={`/owner/dashboard/properties/${property.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/owner/dashboard/properties/${property.id}/edit`}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => setDeleteConfirm(property.id)}
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
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Delete Property</CardTitle>
                <CardDescription>
                  Are you sure you want to delete this property? This action
                  cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

