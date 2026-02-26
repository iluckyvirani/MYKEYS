"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";

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
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");

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
    ];
    setBookings(mockBookings);
    setLoading(false);
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all property bookings</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by booking ID or guest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading bookings...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Booking ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Property</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Guest</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Check-in</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Check-out</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{booking.bookingId}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{booking.propertyTitle}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{booking.guestName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{booking.checkInDate}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{booking.checkOutDate}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ₹{booking.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status === "confirmed" && <CheckCircle className="w-3 h-3" />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
