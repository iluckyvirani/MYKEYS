"use client";

import { Card } from "@/components/ui/card";
import { Calendar, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface RecentBooking {
  id: string;
  propertyName: string;
  location: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  nights: number;
}

export default function AdminRecentBookings() {
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/bookings?pageSize=5&sortBy=createdAt&sortOrder=desc");
        if (response.data?.success && response.data?.data) {
          const bookings = response.data.data.map((booking: any) => ({
            id: booking.id,
            propertyName: booking.propertyTitle || "Unknown Property",
            location: "India", // Location not available in booking API response
            guestName: booking.guestName || "Unknown Guest",
            checkIn: booking.checkInDate || new Date().toISOString().split("T")[0],
            checkOut: booking.checkOutDate || new Date().toISOString().split("T")[0],
            status: (booking.status || "PENDING").toLowerCase() as "confirmed" | "pending" | "completed" | "cancelled",
            nights: booking.nights || 1,
          }));
          setRecentBookings(bookings);
        }
      } catch (err) {
        console.error("Error fetching recent bookings:", err);
        setRecentBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        <Link href="/admin/dashboard/bookings" className="text-sm text-green-600 hover:text-green-700 font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-[5px] animate-pulse">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No bookings found</div>
        ) : (
        recentBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-[5px] hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{booking.propertyName}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {booking.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {booking.guestName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-600">
                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p className="text-xs font-semibold text-gray-900">{booking.nights} nights</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize whitespace-nowrap ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          </div>
        ))
        )}
      </div>
    </Card>
  );
}
