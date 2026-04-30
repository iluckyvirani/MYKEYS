"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminServiceFilterModal } from "@/components/dashboard/admin/services/AdminServiceFilterModal";
import { AdminServiceList } from "@/components/dashboard/admin/services/AdminServiceList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, X, Activity, TrendingUp, Users, Zap } from "lucide-react";

interface ServiceListing {
  id: string;
  name: string;
  category: string;
  provider: string;
  basePrice: number;
  description: string;
  status: "active" | "inactive";
  rating: number;
  reviews: number;
  bookings: number;
}

export default function ServiceListingsPage() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  useEffect(() => {
    const mockServices: ServiceListing[] = [
      {
        id: "1",
        name: "Home Cleaning Service",
        category: "Cleaning",
        provider: "CleanPro Services",
        basePrice: 500,
        description: "Professional home cleaning with eco-friendly products",
        status: "active",
        rating: 4.8,
        reviews: 245,
        bookings: 1203,
      },
      {
        id: "2",
        name: "Plumbing Repair",
        category: "Maintenance",
        provider: "Expert Plumbers Co.",
        basePrice: 800,
        description: "24/7 emergency plumbing services and repairs",
        status: "active",
        rating: 4.6,
        reviews: 189,
        bookings: 876,
      },
      {
        id: "3",
        name: "Electrical Installation",
        category: "Electrical",
        provider: "Spark Electric Solutions",
        basePrice: 1200,
        description: "Complete electrical installation and maintenance",
        status: "active",
        rating: 4.9,
        reviews: 312,
        bookings: 1567,
      },
      {
        id: "4",
        name: "Painting Service",
        category: "Interior Design",
        provider: "Paint Masters",
        basePrice: 1500,
        description: "Interior and exterior painting with premium finishes",
        status: "inactive",
        rating: 4.7,
        reviews: 178,
        bookings: 654,
      },
      {
        id: "5",
        name: "Gardening & Landscaping",
        category: "Gardening",
        provider: "Green Gardens",
        basePrice: 2000,
        description: "Professional gardening and landscape design services",
        status: "active",
        rating: 4.5,
        reviews: 156,
        bookings: 432,
      },
    ];
    setListings(mockServices);
    setLoading(false);
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !appliedFilters.status || listing.status === appliedFilters.status;
    const matchesCategory =
      !appliedFilters.category || listing.category === appliedFilters.category;
    const matchesPriceRange = !appliedFilters.priceRange || checkPriceRange(listing.basePrice, appliedFilters.priceRange);
    return matchesSearch && matchesStatus && matchesCategory && matchesPriceRange;
  });

  const checkPriceRange = (price: number, range: string) => {
    const ranges: { [key: string]: [number, number] } = {
      "£0-500": [0, 500],
      "£500-1000": [500, 1000],
      "£1000-2000": [1000, 2000],
      "£2000+": [2000, Infinity],
    };
    const [min, max] = ranges[range] || [0, Infinity];
    return price >= min && price <= max;
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowAppliedFilters(Object.keys(filters).length > 0);
  };

  const handleClearFilter = (filterKey: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    setAppliedFilters(newFilters);
    setShowAppliedFilters(Object.keys(newFilters).length > 0);
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setShowAppliedFilters(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setListings(listings.filter((l) => l.id !== id));
    }
  };

  const activeServices = listings.filter((l) => l.status === "active").length;
  const inactiveServices = listings.filter((l) => l.status === "inactive").length;
  const totalBookings = listings.reduce((sum, l) => sum + l.bookings, 0);
  const avgRating = (listings.reduce((sum, l) => sum + l.rating, 0) / listings.length).toFixed(1);

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor service listings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {/* Service providers register themselves through the signup flow */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
                <div className="text-sm text-gray-600">Total Services</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeServices} active</span>
              <span className="text-gray-500 ml-2">• {inactiveServices} inactive</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Across all services
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Overall performance
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">£{(listings.reduce((sum, l) => sum + l.basePrice, 0) / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600">Avg Price</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Per service
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-[5px] border p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search services by name or provider..."
                  className="pl-10 w-full rounded-[5px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Applied Filters Display */}
          {showAppliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {appliedFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Status: {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.category && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Category: {appliedFilters.category}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("category")}
                  />
                </Badge>
              )}
              {appliedFilters.priceRange && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Price: {appliedFilters.priceRange}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("priceRange")}
                  />
                </Badge>
              )}
              {Object.keys(appliedFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Service List */}
        <AdminServiceList
          services={filteredListings}
          loading={loading}
          empty={filteredListings.length === 0}
          onDelete={handleDelete}
        />

        {/* Filter Modal */}
        <AdminServiceFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
      </div>
    </AdminDashboardLayout>
  );
}
