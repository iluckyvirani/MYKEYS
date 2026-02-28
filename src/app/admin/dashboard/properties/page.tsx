"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminPropertyFilterModal from "@/components/dashboard/AdminPropertyFilterModal";
import AdminPropertyList from "@/components/dashboard/AdminPropertyList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  Grid,
  List as ListIcon,
  MapPin,
  X,
  Home,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Property {
  id: string;
  title: string;
  owner: string;
  location: string;
  type: string;
  price: number;
  status: "active" | "inactive" | "pending";
  bookings: number;
  images?: Array<{ url: string; isPrimary: boolean }>;
  rating?: number;
  reviewCount?: number;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  totalRevenue: number;
  averageRating: number;
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "ALL",
    type: "ALL",
  });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Mock properties data
  const mockProperties: Property[] = [
    {
      id: "1",
      title: "2BHK Apartment in Bangalore",
      owner: "Rajesh Kumar",
      location: "Bangalore",
      type: "Apartment",
      price: 25000,
      status: "active",
      bookings: 12,
      rating: 4.5,
      reviewCount: 8,
      images: [
        {
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
          isPrimary: true,
        },
      ],
    },
    {
      id: "2",
      title: "Villa with Garden in Mumbai",
      owner: "Suresh Sharma",
      location: "Mumbai",
      type: "Villa",
      price: 50000,
      status: "active",
      bookings: 8,
      rating: 4.8,
      reviewCount: 12,
      images: [
        {
          url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
          isPrimary: true,
        },
      ],
    },
    {
      id: "3",
      title: "Studio Flat in Delhi",
      owner: "Rajesh Kumar",
      location: "Delhi",
      type: "Studio",
      price: 15000,
      status: "pending",
      bookings: 0,
      images: [
        {
          url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
          isPrimary: true,
        },
      ],
    },
    {
      id: "4",
      title: "Luxury Penthouse in Hyderabad",
      owner: "Amit Patel",
      location: "Hyderabad",
      type: "Penthouse",
      price: 75000,
      status: "active",
      bookings: 15,
      rating: 4.9,
      reviewCount: 20,
      images: [
        {
          url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
          isPrimary: true,
        },
      ],
    },
    {
      id: "5",
      title: "Cottage near Pune",
      owner: "Priya Sharma",
      location: "Pune",
      type: "Cottage",
      price: 18000,
      status: "inactive",
      bookings: 3,
      rating: 4.2,
      reviewCount: 5,
      images: [
        {
          url: "https://images.unsplash.com/photo-1516455207990-7a41e1d2afff?w=400&h=300&fit=crop",
          isPrimary: true,
        },
      ],
    },
    {
      id: "6",
      title: "Bungalow in Jaipur",
      owner: "Vikram Singh",
      location: "Jaipur",
      type: "Bungalow",
      price: 35000,
      status: "active",
      bookings: 10,
      rating: 4.6,
      reviewCount: 9,
      images: [
        {
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
          isPrimary: true,
        },
      ],
    },
  ];

  // Fetch properties
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProperties(mockProperties);
      calculateStats(mockProperties);
      setLoading(false);
    }, 800);
  }, []);

  // Calculate stats
  const calculateStats = (props: Property[]) => {
    const activeCount = props.filter((p) => p.status === "active").length;
    const inactiveCount = props.filter((p) => p.status === "inactive").length;
    const totalRev = props.reduce((sum, p) => sum + p.price * p.bookings, 0);
    const avgRating =
      props.length > 0
        ? props.reduce((sum, p) => sum + (p.rating || 0), 0) / props.length
        : 0;

    setStats({
      total: props.length,
      active: activeCount,
      inactive: inactiveCount,
      totalRevenue: totalRev,
      averageRating: Math.round(avgRating * 10) / 10,
    });
  };

  // Filter properties
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      appliedFilters.status === "ALL" ||
      property.status.toUpperCase() === appliedFilters.status;

    const matchesType =
      appliedFilters.type === "ALL" || property.type === appliedFilters.type;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApplyFilters = (filters: { status: string; type: string }) => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setAppliedFilters({ status: "ALL", type: "ALL" });
  };

  const removeFilter = (filterType: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [filterType]: "ALL",
    }));
  };

  const handleDelete = async (propertyId: string) => {
    setDeleting(true);
    // Simulate API call
    setTimeout(() => {
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      calculateStats(properties.filter((p) => p.id !== propertyId));
      setDeleteConfirm(null);
      setDeleting(false);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">Manage all properties on the platform</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]">
            <Download className="w-4 h-4 mr-2" />
            Export Properties
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6 rounded-[5px]">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Properties</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total}
              </h3>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {stats.active}
              </h3>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div>
              <p className="text-gray-600 text-sm font-medium">Inactive</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.inactive}
              </h3>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(stats.totalRevenue)}
              </h3>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
              <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.averageRating}
              </h3>
            </div>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <Card className="p-6 rounded-[5px]">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, location, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-[5px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-[5px] ${viewMode === "grid" ? "bg-gray-100" : ""}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-[5px] ${viewMode === "list" ? "bg-gray-100" : ""}`}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Applied Filters Display */}
          {(appliedFilters.status !== "ALL" || appliedFilters.type !== "ALL") && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Applied Filters:</span>
              {appliedFilters.status !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.type !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  {appliedFilters.type}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("type")}
                  />
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card>

        {/* Properties Section */}
        <Card className="p-6 rounded-[5px]">
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
                No properties have been added yet
              </p>
            </div>
          )}

          {/* Error Alert */}
          {!loading && filteredProperties.length === 0 && properties.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-[5px] flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">No results</h3>
                <p className="text-sm text-yellow-800">
                  No properties match your search and filter criteria
                </p>
              </div>
            </div>
          )}

          {/* Properties List */}
          {!loading && filteredProperties.length > 0 && (
            <AdminPropertyList
              properties={filteredProperties}
              viewMode={viewMode}
              onView={setSelectedProperty}
              onEdit={() => {}}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          )}
        </Card>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm rounded-[5px]">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Property
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this property? This action cannot be
                  undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                    className="rounded-[5px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    className="rounded-[5px]"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AdminPropertyFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </AdminDashboardLayout>
  );
}
