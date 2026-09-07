"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { OwnerFilterModal } from "@/components/dashboard/owner/bookings/OwnerFilterModal";
import { OwnerBookingList } from "@/components/dashboard/owner/bookings/OwnerBookingList";
import BookingCalendar from "@/components/dashboard/OwnerDashboard/BookingCalendar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Filter,
  Search,
  Download,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  X,
  PoundSterling
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const getDaysUntilCheckIn = (checkInDate: string) => {
  const today = new Date();
  const checkIn = new Date(checkInDate);
  const diffTime = checkIn.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  useEffect(() => {
    fetchBookingsAndProperties();
  }, [appliedFilters]);

  const fetchBookingsAndProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params from filters
      const params = new URLSearchParams();
      if (appliedFilters.propertyId) params.append('propertyId', appliedFilters.propertyId);
      if (appliedFilters.status) params.append('status', appliedFilters.status);
      if (appliedFilters.paymentStatus) params.append('paymentStatus', appliedFilters.paymentStatus);
      if (appliedFilters.dateRange?.from) params.append('from', appliedFilters.dateRange.from);
      if (appliedFilters.dateRange?.to) params.append('to', appliedFilters.dateRange.to);
      if (appliedFilters.sortBy) params.append('sortBy', appliedFilters.sortBy);
      if (appliedFilters.search) params.append('search', appliedFilters.search);
      params.append('pageSize', '100');

      // Fetch owner bookings
      const bookingsResponse = await api.get(`/owner/bookings?${params.toString()}`);
      if (bookingsResponse.data?.success && bookingsResponse.data.data?.items) {
        setBookings(bookingsResponse.data.data.items);
        
        // Extract unique properties
        const uniqueProperties = Array.from(
          new Map(
            bookingsResponse.data.data.items.map((b: any) => [
              b.propertyId,
              { id: b.propertyId, title: b.propertyTitle }
            ])
          ).values()
        ) as Array<{ id: string; title: string }>;
        setProperties(uniqueProperties);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status: "CHECKED_IN" });
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: "CHECKED_IN" } : b
      ));
    } catch (err) {
      console.error("Error checking in:", err);
      alert("Failed to check in guest");
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status: "CHECKED_OUT" });
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: "CHECKED_OUT" } : b
      ));
    } catch (err) {
      console.error("Error checking out:", err);
      alert("Failed to check out guest");
    }
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowAppliedFilters(Object.keys(filters).length > 0);
  };

  const handleClearFilter = (filterKey: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    setAppliedFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setShowAppliedFilters(false);
  };

  if (error) {
    return (
      <DashboardLayout defaultRole="agent">
        <div className="bg-red-50 border border-red-200 rounded-[5px] p-4 text-red-700">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
          <Button size="sm" onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="agent">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 mt-2">
              Manage all your property bookings, check-ins, and check-outs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create Booking
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">
                {bookings.filter(b => b.status?.toUpperCase() === "CONFIRMED").length} confirmed
              </span>
              <span className="text-gray-500 ml-2">� {bookings.filter(b => b.status?.toUpperCase() === "PENDING").length} pending</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  �{bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0).toLocaleString('en-GB')}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <PoundSterling  className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Last 30 days
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => 
                    b.status?.toUpperCase() === "CONFIRMED" && getDaysUntilCheckIn(b.checkInDate) > 0
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Next 30 days
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  �{bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length).toLocaleString('en-GB') : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Booking Value</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Per booking
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[5px] border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by guest name or property..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                value={appliedFilters.search || ""}
                onChange={(e) => {
                  const newFilters = { ...appliedFilters, search: e.target.value || undefined };
                  setAppliedFilters(newFilters);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm ${viewMode === "list" ? "bg-white shadow" : ""}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 rounded-md text-sm ${viewMode === "calendar" ? "bg-white shadow" : ""}`}
              >
                Calendar
              </button>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterModalOpen(true)}
              className="cursor-pointer"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Applied Filters Display */}
        {showAppliedFilters && Object.keys(appliedFilters).filter(k => k !== 'sortBy' && k !== 'search').length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {appliedFilters.status && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Status: {appliedFilters.status}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...appliedFilters };
                    delete newFilters.status;
                    setAppliedFilters(newFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.paymentStatus && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Payment: {appliedFilters.paymentStatus}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...appliedFilters };
                    delete newFilters.paymentStatus;
                    setAppliedFilters(newFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.propertyId && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Property: {properties.find(p => p.id === appliedFilters.propertyId)?.title || appliedFilters.propertyId}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...appliedFilters };
                    delete newFilters.propertyId;
                    setAppliedFilters(newFilters);
                  }}
                />
              </Badge>
            )}
            {(appliedFilters.dateRange?.from || appliedFilters.dateRange?.to) && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Date Range: {appliedFilters.dateRange?.from} to {appliedFilters.dateRange?.to}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...appliedFilters };
                    delete newFilters.dateRange;
                    setAppliedFilters(newFilters);
                  }}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Booking List or Calendar */}
      {viewMode === "list" ? (
        <OwnerBookingList
          bookings={bookings}
          loading={loading}
          empty={bookings.length === 0}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      ) : (
        <BookingCalendar />
      )}

      {/* Modals */}
      <OwnerFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
        properties={properties}
        appliedFilters={appliedFilters}
      />
    </DashboardLayout>
  );
}