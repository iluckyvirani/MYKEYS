"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Zap, Filter, Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceBookingTabs from "@/components/dashboard/UserDashboard/ServiceBookingTabs";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ServiceBookingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    status?: string;
    bookingType?: string;
    dateFrom?: string;
    dateTo?: string;
  } | null>(null);
  const [tempFilters, setTempFilters] = useState<{
    status?: string;
    bookingType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setFilterModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setAppliedFilters(null);
    setTempFilters({});
    setRefreshKey(prev => prev + 1);
  };

  const handleRemoveFilter = (key: string) => {
    setAppliedFilters(prev => {
      if (!prev) return null;
      const newFilters = { ...prev };
      delete newFilters[key as keyof typeof newFilters];
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
            Filters
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
            {appliedFilters.dateFrom && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-2">
                From: {appliedFilters.dateFrom}
                <button
                  onClick={() => handleRemoveFilter('dateFrom')}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {appliedFilters.dateTo && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-2">
                To: {appliedFilters.dateTo}
                <button
                  onClick={() => handleRemoveFilter('dateTo')}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-red-600 hover:text-red-700 cursor-pointer"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Service Booking Tabs */}
      <ServiceBookingTabs 
        key={refreshKey} 
        searchQuery={debouncedSearch}
        filters={appliedFilters || undefined}
      />

      {/* Filter Modal */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Service Bookings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={tempFilters.status || ''}
                onValueChange={(value) =>
                  setTempFilters({ ...tempFilters, status: value || undefined })
                }
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Booking Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type-filter">Booking Type</Label>
              <Select
                value={tempFilters.bookingType || ''}
                onValueChange={(value) =>
                  setTempFilters({ ...tempFilters, bookingType: value || undefined })
                }
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={tempFilters.dateFrom || ''}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, dateFrom: e.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={tempFilters.dateTo || ''}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, dateTo: e.target.value || undefined })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTempFilters({});
                setFilterModalOpen(false);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleApplyFilters} className="cursor-pointer">
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
