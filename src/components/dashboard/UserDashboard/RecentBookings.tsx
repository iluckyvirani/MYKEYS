"use client";

import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ShortBookingDTO } from "@/types/booking";

export default function RecentBookings() {
  const [bookings, setBookings] = useState<ShortBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/bookings?pageSize=10");

        if (response.data?.success && response.data.data?.items) {
          // Get only first 3 bookings
          const recentBookings = response.data.data.items.slice(0, 3);
          setBookings(recentBookings);
          setError(null);
        } else {
          setError("Failed to load bookings");
        }
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(null); // Don't show error, just show empty list
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] shadow-sm border p-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-500">Your active and upcoming stays</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <p className="text-sm text-gray-500">Your active and upcoming stays</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-[5px] cursor-pointer" asChild>
          <Link href="/user/dashboard/bookings">View All</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No bookings yet. Start exploring properties!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 rounded-[5px] border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Property Booking</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </div>
                    {booking.numberOfGuests && (
                      <div className="text-sm text-gray-500">
                        {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {booking.balanceAmount > 0
                    ? `₹${booking.balanceAmount.toLocaleString('en-IN')} due`
                    : 'Paid'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}