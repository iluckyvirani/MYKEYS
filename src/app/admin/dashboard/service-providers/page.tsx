"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminServiceProviderFilterModal } from "@/components/dashboard/admin/service-providers/AdminServiceProviderFilterModal";
import { AdminServiceProviderList } from "@/components/dashboard/admin/service-providers/AdminServiceProviderList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, X, Users, TrendingUp, Star, Zap } from "lucide-react";

interface ServiceProvider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  serviceType: string;
  bookings: number;
  rating: number;
  status: "active" | "inactive";
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  useEffect(() => {
    const mockProviders: ServiceProvider[] = [
      {
        id: "1",
        firstName: "Amit",
        lastName: "Patel",
        email: "amit@example.com",
        serviceType: "Plumbing",
        bookings: 45,
        rating: 4.8,
        status: "active",
      },
      {
        id: "2",
        firstName: "Pradeep",
        lastName: "Singh",
        email: "pradeep@example.com",
        serviceType: "Electrical",
        bookings: 32,
        rating: 4.6,
        status: "active",
      },
      {
        id: "3",
        firstName: "Rohan",
        lastName: "Kumar",
        email: "rohan@example.com",
        serviceType: "Cleaning",
        bookings: 28,
        rating: 4.7,
        status: "active",
      },
      {
        id: "4",
        firstName: "Vikram",
        lastName: "Sharma",
        email: "vikram@example.com",
        serviceType: "Carpentry",
        bookings: 22,
        rating: 4.4,
        status: "inactive",
      },
      {
        id: "5",
        firstName: "Sanjay",
        lastName: "Verma",
        email: "sanjay@example.com",
        serviceType: "Painting",
        bookings: 38,
        rating: 4.9,
        status: "active",
      },
    ];
    setProviders(mockProviders);
    setLoading(false);
  }, []);

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !appliedFilters.status || provider.status === appliedFilters.status;
    const matchesServiceType =
      !appliedFilters.serviceType || provider.serviceType === appliedFilters.serviceType;
    const matchesRating = !appliedFilters.ratingRange || checkRatingRange(provider.rating, appliedFilters.ratingRange);
    return matchesSearch && matchesStatus && matchesServiceType && matchesRating;
  });

  const checkRatingRange = (rating: number, range: string) => {
    const ranges: { [key: string]: number } = {
      "4.5+": 4.5,
      "4.0+": 4.0,
      "3.5+": 3.5,
    };
    const minRating = ranges[range] || 0;
    return rating >= minRating;
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
    if (confirm("Are you sure you want to delete this service provider?")) {
      setProviders(providers.filter((p) => p.id !== id));
    }
  };

  const activeProviders = providers.filter((p) => p.status === "active").length;
  const inactiveProviders = providers.filter((p) => p.status === "inactive").length;
  const totalBookings = providers.reduce((sum, p) => sum + p.bookings, 0);
  const avgRating = (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1);

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Provider Management</h1>
            <p className="text-gray-600 mt-2">
              Manage service providers and their performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{providers.length}</div>
                <div className="text-sm text-gray-600">Total Providers</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeProviders} active</span>
              <span className="text-gray-500 ml-2">• {inactiveProviders} inactive</span>
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
              All time bookings
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Overall performance
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{(totalBookings / providers.length).toFixed(0)}</div>
                <div className="text-sm text-gray-600">Avg Bookings</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Per provider
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
                  placeholder="Search providers by name or email..."
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
              {appliedFilters.serviceType && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Service: {appliedFilters.serviceType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("serviceType")}
                  />
                </Badge>
              )}
              {appliedFilters.ratingRange && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Rating: {appliedFilters.ratingRange}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("ratingRange")}
                  />
                </Badge>
              )}
              {Object.keys(appliedFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Provider List */}
        <AdminServiceProviderList
          providers={filteredProviders}
          loading={loading}
          empty={filteredProviders.length === 0}
          onDelete={handleDelete}
        />

        {/* Filter Modal */}
        <AdminServiceProviderFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
      </div>
    </AdminDashboardLayout>
  );
}
