"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  Download, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  Share2,
  FileText,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock bookings data
const mockBookings = [
  {
    id: "BOOK001",
    property: "Seaside Luxury Villa",
    propertyId: "PROP001",
    guest: "Rajesh Kumar",
    guestEmail: "rajesh@example.com",
    guestPhone: "+91 9876543210",
    checkIn: "2024-01-15",
    checkOut: "2024-01-22",
    nights: 7,
    bookingDate: "2024-01-10",
    status: "confirmed", // confirmed, pending, cancelled, completed
    amount: 315000,
    cleaningFee: 5000,
    serviceFee: 3500,
    totalAmount: 323500,
    paidAmount: 323500,
    balanceAmount: 0,
    paymentStatus: "paid", // paid, partial, pending, refunded
    paymentMethod: "credit_card",
    guests: 4,
    children: 1,
    pets: 0,
    specialRequests: "Early check-in requested if available",
    notes: "Repeat customer, prefers room on ground floor",
    source: "website",
    commission: 12000,
    channel: "direct",
    bookingType: "short_stay",
    lastUpdated: "2024-01-10T14:30:00",
  },
  {
    id: "BOOK002",
    property: "Modern 2BHK Apartment",
    propertyId: "PROP002",
    guest: "Priya Sharma",
    guestEmail: "priya@example.com",
    guestPhone: "+91 8765432109",
    checkIn: "2024-01-05",
    checkOut: "2024-01-12",
    nights: 7,
    bookingDate: "2024-01-02",
    status: "completed",
    amount: 245000,
    cleaningFee: 3000,
    serviceFee: 2500,
    totalAmount: 250500,
    paidAmount: 250500,
    balanceAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "upi",
    guests: 2,
    children: 0,
    pets: 0,
    specialRequests: "Need parking space",
    notes: "Quiet guests, left property clean",
    source: "mobile_app",
    commission: 9000,
    channel: "ota",
    bookingType: "short_stay",
    lastUpdated: "2024-01-12T10:00:00",
  },
  {
    id: "BOOK003",
    property: "Mountain View Cottage",
    propertyId: "PROP003",
    guest: "Amit Patel",
    guestEmail: "amit@example.com",
    guestPhone: "+91 7654321098",
    checkIn: "2024-01-20",
    checkOut: "2024-01-25",
    nights: 5,
    bookingDate: "2024-01-15",
    status: "pending",
    amount: 90000,
    cleaningFee: 2500,
    serviceFee: 1800,
    totalAmount: 94300,
    paidAmount: 0,
    balanceAmount: 94300,
    paymentStatus: "pending",
    paymentMethod: "bank_transfer",
    guests: 3,
    children: 0,
    pets: 1,
    specialRequests: "Traveling with a small dog",
    notes: "Waiting for payment confirmation",
    source: "website",
    commission: 0,
    channel: "direct",
    bookingType: "short_stay",
    lastUpdated: "2024-01-15T16:45:00",
  },
  {
    id: "BOOK004",
    property: "Modern 2BHK Apartment",
    propertyId: "PROP002",
    guest: "Sneha Reddy",
    guestEmail: "sneha@example.com",
    guestPhone: "+91 6543210987",
    checkIn: "2024-01-25",
    checkOut: "2024-02-25",
    nights: 31,
    bookingDate: "2024-01-18",
    status: "confirmed",
    amount: 250000,
    cleaningFee: 0,
    serviceFee: 12500,
    totalAmount: 262500,
    paidAmount: 262500,
    balanceAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "credit_card",
    guests: 2,
    children: 0,
    pets: 0,
    specialRequests: "Long-term rental for work assignment",
    notes: "Security deposit: ₹75,000",
    source: "website",
    commission: 15000,
    channel: "direct",
    bookingType: "long_term",
    lastUpdated: "2024-01-18T11:20:00",
  },
  {
    id: "BOOK005",
    property: "Beachfront Bungalow",
    propertyId: "PROP005",
    guest: "Vikram Singh",
    guestEmail: "vikram@example.com",
    guestPhone: "+91 5432109876",
    checkIn: "2024-01-28",
    checkOut: "2024-02-04",
    nights: 7,
    bookingDate: "2024-01-20",
    status: "cancelled",
    amount: 224000,
    cleaningFee: 4000,
    serviceFee: 3100,
    totalAmount: 231100,
    paidAmount: 231100,
    balanceAmount: 0,
    paymentStatus: "refunded",
    paymentMethod: "credit_card",
    guests: 4,
    children: 2,
    pets: 0,
    specialRequests: "Family vacation",
    notes: "Cancelled due to travel restrictions, full refund processed",
    source: "mobile_app",
    commission: 0,
    channel: "ota",
    bookingType: "short_stay",
    lastUpdated: "2024-01-21T09:15:00",
  },
  {
    id: "BOOK006",
    property: "Seaside Luxury Villa",
    propertyId: "PROP001",
    guest: "Anjali Mehta",
    guestEmail: "anjali@example.com",
    guestPhone: "+91 4321098765",
    checkIn: "2024-02-10",
    checkOut: "2024-02-17",
    nights: 7,
    bookingDate: "2024-01-22",
    status: "confirmed",
    amount: 315000,
    cleaningFee: 5000,
    serviceFee: 3500,
    totalAmount: 323500,
    paidAmount: 161750,
    balanceAmount: 161750,
    paymentStatus: "partial",
    paymentMethod: "upi",
    guests: 6,
    children: 0,
    pets: 0,
    specialRequests: "Anniversary celebration",
    notes: "50% advance paid, balance due 7 days before check-in",
    source: "website",
    commission: 12000,
    channel: "direct",
    bookingType: "short_stay",
    lastUpdated: "2024-01-22T14:30:00",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "confirmed":
      return { 
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Confirmed",
        icon: CheckCircle,
      };
    case "pending":
      return { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
        icon: Clock,
      };
    case "cancelled":
      return { 
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
        icon: XCircle,
      };
    case "completed":
      return { 
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Completed",
        icon: CheckCircle,
      };
    default:
      return { 
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Unknown",
        icon: AlertCircle,
      };
  }
};

const getPaymentStatusConfig = (status: string) => {
  switch (status) {
    case "paid":
      return { 
        color: "bg-green-100 text-green-800",
        label: "Paid",
      };
    case "partial":
      return { 
        color: "bg-yellow-100 text-yellow-800",
        label: "Partial",
      };
    case "pending":
      return { 
        color: "bg-orange-100 text-orange-800",
        label: "Pending",
      };
    case "refunded":
      return { 
        color: "bg-purple-100 text-purple-800",
        label: "Refunded",
      };
    default:
      return { 
        color: "bg-gray-100 text-gray-800",
        label: "Unknown",
      };
  }
};

const getBookingTypeBadge = (type: string) => {
  switch (type) {
    case "short_stay":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Short Stay",
      };
    case "long_term":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Long Term",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Other",
      };
  }
};

const getDaysUntilCheckIn = (checkInDate: string) => {
  const today = new Date();
  const checkIn = new Date(checkInDate);
  const diffTime = checkIn.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);
  const [filter, setFilter] = useState("all"); // all, confirmed, pending, cancelled, completed
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredBookings = bookings.filter(booking => {
    if (filter !== "all" && booking.status !== filter) return false;
    if (selectedStatus && booking.status !== selectedStatus) return false;
    if (search && !booking.guest.toLowerCase().includes(search.toLowerCase()) && 
        !booking.property.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const confirmBooking = (id: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id 
        ? { ...booking, status: "confirmed" }
        : booking
    ));
  };

  const cancelBooking = (id: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id 
        ? { ...booking, status: "cancelled" }
        : booking
    ));
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const upcomingBookings = bookings.filter(b => 
    b.status === "confirmed" && getDaysUntilCheckIn(b.checkIn) > 0
  ).length;
  const avgBookingValue = bookings.length > 0 
    ? bookings.reduce((sum, b) => sum + b.totalAmount, 0) / bookings.length
    : 0;

  const getStatusStats = () => {
    const stats = {
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      completed: 0,
    };
    
    bookings.forEach(booking => {
      stats[booking.status as keyof typeof stats]++;
    });
    
    return stats;
  };

  const statusStats = getStatusStats();

  return (
    <DashboardLayout defaultRole="owner">
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
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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
              <span className="text-green-600 font-medium">{confirmedBookings} confirmed</span>
              <span className="text-gray-500 ml-2">• {pendingBookings} pending</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Last 30 days
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{upcomingBookings}</div>
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
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(avgBookingValue)}</div>
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

        {/* Status Breakdown */}
        <div className="mt-4 bg-white rounded-[5px] border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Booking Status Breakdown</h3>
            <span className="text-sm text-gray-500">All time</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(statusStats).map(([status, count]) => {
              const statusConfig = getStatusConfig(status);
              const StatusIcon = statusConfig.icon;
              const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;

              return (
                <div key={status} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${statusConfig.color.split(' ')[0]}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{statusConfig.label}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: statusConfig.color.includes('green') ? '#10b981' : 
                                         statusConfig.color.includes('yellow') ? '#f59e0b' :
                                         statusConfig.color.includes('red') ? '#ef4444' :
                                         statusConfig.color.includes('blue') ? '#3b82f6' : '#6b7280'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[5px] border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by guest name or property..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

            <select 
              className="border rounded-[5px] px-3 py-2.5 text-sm bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["all", "confirmed", "pending", "upcoming", "cancelled", "completed"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 text-sm rounded-[5px] border ${
                filter === filterType
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {filterType === "all" && "All"}
              {filterType === "confirmed" && "Confirmed"}
              {filterType === "pending" && "Pending"}
              {filterType === "upcoming" && "Upcoming"}
              {filterType === "cancelled" && "Cancelled"}
              {filterType === "completed" && "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-[5px] border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Booking Details</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Dates</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                const paymentConfig = getPaymentStatusConfig(booking.paymentStatus);
                const bookingTypeBadge = getBookingTypeBadge(booking.bookingType);
                const daysUntilCheckIn = getDaysUntilCheckIn(booking.checkIn);
                const isUpcoming = daysUntilCheckIn > 0 && daysUntilCheckIn <= 7;
                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={booking.id} className="border-b hover:bg-gray-50 group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                          <Home className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/owner/dashboard/properties/${booking.propertyId}`}
                              className="font-medium text-gray-900 hover:text-green-600 truncate"
                            >
                              {booking.property}
                            </Link>
                            {isUpcoming && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                {daysUntilCheckIn} day{daysUntilCheckIn !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Users className="w-3 h-3" />
                            {booking.guest} • {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                            {booking.children > 0 && ` • ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            <span className={`px-2 py-0.5 rounded ${bookingTypeBadge.color}`}>
                              {bookingTypeBadge.label}
                            </span>
                            <span className="ml-2">#{booking.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - 
                          {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-400">
                          Booked: {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                        {booking.channel && (
                          <div className="text-xs text-gray-500">
                            via {booking.channel.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${paymentConfig.color}`}>
                          {paymentConfig.label}
                        </span>
                        {booking.paymentStatus === "partial" && (
                          <div className="text-xs text-gray-600">
                            Balance: {formatCurrency(booking.balanceAmount)}
                          </div>
                        )}
                        {booking.paymentMethod && (
                          <div className="text-xs text-gray-400">
                            {booking.paymentMethod.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Paid: {formatCurrency(booking.paidAmount)}
                      </div>
                      {booking.commission > 0 && (
                        <div className="text-xs text-gray-400">
                          Commission: {formatCurrency(booking.commission)}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/owner/dashboard/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/owner/dashboard/bookings/${booking.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => confirmBooking(booking.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => cancelBooking(booking.id)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message Guest
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Generate Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Calendar View
        <div className="bg-white rounded-[5px] border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Booking Calendar</h3>
              <p className="text-sm text-gray-500 mt-1">
                Visual overview of all bookings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-lg font-semibold">January 2024</div>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Simplified Calendar Grid */}
          <div className="border rounded-lg p-4">
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h4>
              <p className="text-gray-500 mb-4">Switch to calendar view to see a visual timeline of all bookings</p>
              <Button variant="outline">
                Open Full Calendar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {filteredBookings.length > 0 && (
        <div className="mt-6 bg-white rounded-[5px] border p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings • 
              Total Revenue: {formatCurrency(filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0))} • 
              Average Stay: {Math.round(filteredBookings.reduce((sum, b) => sum + b.nights, 0) / filteredBookings.length)} nights
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {filteredBookings.filter(b => b.status === "confirmed").length}
                </div>
                <div className="text-xs text-gray-500">Active Bookings</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Bookings
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[5px] border p-4">
          <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Customer Support
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Booking Policies
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Payment Issues
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-[5px] border p-4">
          <h4 className="font-medium text-gray-900 mb-3">Quick Tools</h4>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Sync Calendar
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-[5px] border p-4">
          <h4 className="font-medium text-gray-900 mb-3">Upcoming Check-ins</h4>
          <div className="space-y-2">
            {bookings
              .filter(b => b.status === "confirmed" && getDaysUntilCheckIn(b.checkIn) <= 3)
              .slice(0, 3)
              .map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{booking.property}</div>
                    <div className="text-xs text-gray-500">{booking.guest}</div>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    {getDaysUntilCheckIn(booking.checkIn)} day{getDaysUntilCheckIn(booking.checkIn) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}