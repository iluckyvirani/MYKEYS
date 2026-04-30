"use client";

import { Eye, Edit, CheckCircle, Clock, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface AdminBookingListProps {
  bookings: Booking[];
  loading?: boolean;
  empty?: boolean;
  onEdit?: (id: string) => void;
  onView?: (booking: Booking) => void;
}

export function AdminBookingList({
  bookings,
  loading = false,
  empty = false,
  onEdit,
  onView,
}: AdminBookingListProps) {
  const getStatusIcon = (status: "confirmed" | "pending" | "cancelled") => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: "confirmed" | "pending" | "cancelled") => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading bookings...</div>;
  }

  if (empty || bookings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Booking ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Property
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Guest
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Dates
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Nights
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {booking.bookingId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{booking.propertyTitle}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{booking.guestName}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{booking.checkInDate} to {booking.checkOutDate}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {calculateNights(booking.checkInDate, booking.checkOutDate)} nights
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                £{booking.totalAmount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(booking.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onView?.(booking)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit?.(booking.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
