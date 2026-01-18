"use client";

import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

const mockBookings = [
  {
    id: "BK001",
    property: "Seaside Villa, Goa",
    type: "short_term",
    dates: "Jan 15 - Jan 22, 2024",
    amount: 45000,
    status: "confirmed",
    nights: 7,
  },
  {
    id: "BK002",
    property: "Urban Apartment, Mumbai",
    type: "long_term",
    dates: "Feb 1 - Jul 31, 2024",
    amount: 150000,
    status: "pending",
    nights: 180,
  },
  {
    id: "BK003",
    property: "Luxury Penthouse, Delhi",
    type: "purchase",
    dates: "Under Negotiation",
    amount: 25000000,
    status: "processing",
    nights: null,
  },
];

export default function RecentBookings() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <p className="text-sm text-gray-500">Your active and upcoming stays</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {mockBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{booking.property}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {booking.dates}
                  </div>
                  {booking.nights && (
                    <div className="text-sm text-gray-500">
                      {booking.nights} nights
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
                  <span className="text-sm text-gray-500">
                    {booking.type.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-gray-900">
                {formatCurrency(booking.amount)}
              </div>
              <div className="text-sm text-gray-500">
                {booking.type === "purchase" ? "Total value" : "Total amount"}
              </div>
              <Button variant="ghost" size="sm" className="mt-2">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}