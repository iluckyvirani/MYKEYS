"use client";

import { Card } from "@/components/ui/card";
import { Calendar, MapPin, User } from "lucide-react";
import Link from "next/link";

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

const recentBookings: RecentBooking[] = [
  {
    id: "BK001",
    propertyName: "Sunset Villa",
    location: "Mumbai, MH",
    guestName: "Arjun Mishra",
    checkIn: "2024-02-25",
    checkOut: "2024-02-28",
    status: "confirmed",
    nights: 3,
  },
  {
    id: "BK002",
    propertyName: "Beach House",
    location: "Goa, GA",
    guestName: "Divya Sharma",
    checkIn: "2024-03-01",
    checkOut: "2024-03-05",
    status: "pending",
    nights: 4,
  },
  {
    id: "BK003",
    propertyName: "Mountain Retreat",
    location: "Himalayan Hills, HP",
    guestName: "Rohit Kumar",
    checkIn: "2024-02-15",
    checkOut: "2024-02-22",
    status: "completed",
    nights: 7,
  },
  {
    id: "BK004",
    propertyName: "Lake View Cottage",
    location: "Udaipur, RJ",
    guestName: "Neha Patel",
    checkIn: "2024-02-10",
    checkOut: "2024-02-12",
    status: "cancelled",
    nights: 2,
  },
  {
    id: "BK005",
    propertyName: "City Apartment",
    location: "Delhi, DL",
    guestName: "Vikram Singh",
    checkIn: "2024-02-28",
    checkOut: "2024-03-02",
    status: "confirmed",
    nights: 2,
  },
];

export default function AdminRecentBookings() {
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
        {recentBookings.map((booking) => (
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
        ))}
      </div>
    </Card>
  );
}
