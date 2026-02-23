"use client";

import { Calendar, Clock, MapPin, User, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ServiceBooking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: "pending" | "confirmed" | "in-progress" | "completed";
  amount: number;
}

export default function RecentBookings() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/service/bookings?limit=3&sortBy=createdAt&sortOrder=desc");
        const data = res.data?.data?.items;
        if (data) {
          setBookings(data);
        }
      } catch (err) {
        console.error("Failed to fetch recent bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        <Link
          href="/service/dashboard/bookings"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent bookings</p>
        ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {booking.service}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <User className="w-4 h-4" />
                  {booking.clientName}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  booking.status
                )}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(booking.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {booking.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {booking.location}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">₹{booking.amount}</p>
              <Link
                href={`/service/dashboard/bookings/${booking.id}`}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View
              </Link>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
