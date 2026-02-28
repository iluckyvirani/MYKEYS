"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminBookingFilterModal } from "@/components/dashboard/admin/bookings/AdminBookingFilterModal";
import { AdminBookingList } from "@/components/dashboard/admin/bookings/AdminBookingList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, X, Calendar, TrendingUp, Users, DollarSign } from "lucide-react";

interface Booking {
  id: string;
  bookingId: string;
  propertyTitle: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: "1",
        bookingId: "BK001",
        propertyTitle: "2BHK Apartment",
        guestName: "Priya Singh",
        checkInDate: "2025-03-10",
        checkOutDate: "2025-03-15",
        totalAmount: 125000,
        status: "confirmed",
      },
      {
        id: "2",
        bookingId: "BK002",
        propertyTitle: "Villa with Garden",
        guestName: "Arjun Nair",
        checkInDate: "2025-03-12",
        checkOutDate: "2025-03-20",
        totalAmount: 400000,
        status: "confirmed",
      },
      {
        id: "3",
        bookingId: "BK003",
        propertyTitle: "Studio Flat",
        guestName: "Neha Sharma",
        checkInDate: "2025-03-15",
        checkOutDate: "2025-03-18",
        totalAmount: 45000,
        status: "pending",
      },
      {
        id: "4",
        bookingId: "BK004",
        propertyTitle: "Luxury Penthouse",
        guestName: "Rahul Verma",
        checkInDate: "2025-03-05",
        checkOutDate: "2025-03-25",
        totalAmount: 750000,
        status: "confirmed",
      },
      {
        id: "5",
        bookingId: "BK005",
        propertyTitle: "Cozy Studio",
        guestName: "Anjali Gupta",
        checkInDate: "2025-02-28",
        checkOutDate: "2025-03-02",
        totalAmount: 35000,
        status: "cancelled",
      },
    ];
    setBookings(mockBookings);
    setLoading(false);
  }, []);

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !appliedFilters.status || booking.status === appliedFilters.status;
    const matchesDuration =
      !appliedFilters.duration || checkDurationRange(calculateNights(booking.checkInDate, booking.checkOutDate), appliedFilters.duration);
    const matchesPriceRange =
      !appliedFilters.priceRange || checkPriceRange(booking.totalAmount, appliedFilters.priceRange);
    return matchesSearch && matchesStatus && matchesDuration && matchesPriceRange;
  });

  const checkDurationRange = (nights: number, range: string) => {
    const ranges: { [key: string]: [number, number] } = {
      "1-3 nights": [1, 3],
      "4-7 nights": [4, 7],
      "8-15 nights": [8, 15],
      "15+ nights": [15, Infinity],
    };
    const [min, max] = ranges[range] || [0, Infinity];
    return nights >= min && nights <= max;
  };

  const checkPriceRange = (amount: number, range: string) => {
    const ranges: { [key: string]: [number, number] } = {
      "₹0-50K": [0, 50000],
      "₹50K-100K": [50000, 100000],
      "₹100K-200K": [100000, 200000],
      "₹200K+": [200000, Infinity],
    };
    const [min, max] = ranges[range] || [0, Infinity];
    return amount >= min && amount <= max;
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
    if (confirm("Are you sure you want to delete this booking?")) {
      setBookings(bookings.filter((b) => b.id !== id));
    }
  };

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const avgBookingValue = confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0;

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">
              Track and manage all property bookings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{confirmedBookings} confirmed</span>
              <span className="text-gray-500 ml-2">• {pendingBookings} pending</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">₹{(totalRevenue / 100000).toFixed(2)}L</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              From confirmed bookings
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">₹{(avgBookingValue / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600">Avg Booking Value</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Per confirmed booking
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{(confirmedBookings / bookings.length * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Confirmation Rate</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Success ratio
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
                  placeholder="Search by booking ID, property, or guest name..."
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
              {appliedFilters.duration && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Duration: {appliedFilters.duration}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("duration")}
                  />
                </Badge>
              )}
              {appliedFilters.priceRange && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Value: {appliedFilters.priceRange}
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
                  className="text-red-600 hover:text-red-700"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Booking List */}
        <AdminBookingList
          bookings={filteredBookings}
          loading={loading}
          empty={filteredBookings.length === 0}
          onDelete={handleDelete}
        />

        {/* Filter Modal */}
        <AdminBookingFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
      </div>
    </AdminDashboardLayout>
  );
}
