"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Zap, Filter, Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceBookingTabs from "@/components/dashboard/UserDashboard/ServiceBookingTabs";
import { ServicebookingFilterModal } from "@/components/dashboard/UserDashboard/FilterModal";
import { useRouter } from "next/navigation";

export default function ServiceBookingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClearFilters = () => {
    setAppliedFilters(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleRemoveFilter = (key: string) => {
    setAppliedFilters((prev: any) => {
      if (!prev) return null;
      const newFilters = { ...prev };
      delete newFilters[key];
      return Object.keys(newFilters).length > 0 ? newFilters : null;
    });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Service Bookings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all your service bookings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/user/dashboard/services')}
              className="cursor-pointer"
            >
              <Zap className="w-4 h-4 mr-2" />
              Book New Service
            </Button>
            <Button className="cursor-pointer" onClick={() => alert('Export functionality coming soon!')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[5px] p-6 mb-5 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by service name, provider, or booking ID..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterModalOpen(true)}
            className="w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        {/* Applied Filters */}
        {appliedFilters && Object.keys(appliedFilters).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {appliedFilters.status && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2">
                Status: {appliedFilters.status}
                <button
                  onClick={() => handleRemoveFilter('status')}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {appliedFilters.bookingType && (
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-2">
                Type: {appliedFilters.bookingType}
                <button
                  onClick={() => handleRemoveFilter('bookingType')}
                  className="hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {(appliedFilters.fromDate || appliedFilters.toDate) && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-2">
                Date: {appliedFilters.fromDate || "Any"} to {appliedFilters.toDate || "Any"}
                <button
                  onClick={() => handleRemoveFilter('fromDate')}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {appliedFilters.sortBy && appliedFilters.sortBy !== 'recent' && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-2">
                Sort: {appliedFilters.sortBy}
                <button
                  onClick={() => handleRemoveFilter('sortBy')}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button
              className="text-xs text-gray-500 underline hover:text-gray-700 cursor-pointer"
              onClick={handleClearFilters}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Service Booking Tabs */}
      <ServiceBookingTabs
        key={refreshKey}
        searchQuery={debouncedSearch}
        filters={appliedFilters || undefined}
      />

      {/* Service Booking Filter Modal */}
      <ServicebookingFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setRefreshKey(prev => prev + 1);
        }}
      />
    </DashboardLayout>
  );
}
