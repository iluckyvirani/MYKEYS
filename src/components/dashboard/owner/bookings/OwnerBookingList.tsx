"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical,
  Home,
  Users,
  Loader,
  LogIn,
  LogOut,
} from "lucide-react";

interface Booking {
  id: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  propertyId: string;
}

interface BookingListProps {
  bookings: Booking[];
  loading?: boolean;
  empty?: boolean;
  onConfirm?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
  onCheckIn?: (bookingId: string) => void;
  onCheckOut?: (bookingId: string) => void;
}

export function OwnerBookingList({
  bookings,
  loading = false,
  empty = false,
  onConfirm,
  onCancel,
  onCheckIn,
  onCheckOut,
}: BookingListProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "confirmed":
      case "active":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          label: normalizedStatus === "active" ? "Active" : "Confirmed",
        };
      case "checked_in":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Checked In",
        };
      case "checked_out":
        return {
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
          label: "Checked Out",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          label: "Pending",
        };
      case "completed":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Completed",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: status || "Unknown",
        };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "paid":
        return { color: "bg-green-100 text-green-800", label: "Paid" };
      case "pending":
        return { color: "bg-orange-100 text-orange-800", label: "Pending" };
      case "partial":
        return { color: "bg-yellow-100 text-yellow-800", label: "Partial" };
      case "refunded":
        return { color: "bg-purple-100 text-purple-800", label: "Refunded" };
      case "failed":
        return { color: "bg-red-100 text-red-800", label: "Failed" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status || "Unknown" };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-green-600" />
          <span className="text-gray-600">Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (empty || bookings.length === 0) {
    return (
      <div className="bg-white rounded-[5px] border py-12 px-4 text-center">
        <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-gray-900 font-semibold mb-1">No bookings found</h3>
        <p className="text-gray-500 text-sm">
          Try adjusting your filters or create a new booking
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Booking Details
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Dates
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Payment
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const paymentConfig = getPaymentStatusConfig(booking.paymentStatus);
              const upperStatus = booking.status?.toUpperCase() || "";

              // Check In is available from the check-in date onwards
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const checkInDay = new Date(booking.checkInDate);
              checkInDay.setHours(0, 0, 0, 0);
              const canCheckIn = upperStatus === "CONFIRMED" && checkInDay <= today;
              const canCheckOut = upperStatus === "CHECKED_IN";

              return (
                <tr key={booking.id} className="hover:bg-gray-50 group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-100 to-green-100 flex items-center justify-center shrink-0">
                        <Home className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/owner/dashboard/properties/${booking.propertyId}`}
                          className="font-medium text-gray-900 hover:text-green-600 truncate block"
                        >
                          {booking.propertyTitle}
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Users className="w-3 h-3" />
                          <span>{booking.guestName}</span>
                          <span>•</span>
                          <span>
                            {booking.numberOfGuests} guest
                            {booking.numberOfGuests !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          #{booking.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {new Date(booking.checkInDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        -{" "}
                        {new Date(booking.checkOutDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.numberOfNights} night
                        {booking.numberOfNights !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  </td>

                  <td className="py-4 px-4">
                    <Badge className={paymentConfig.color}>{paymentConfig.label}</Badge>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900">
                      £{booking.totalAmount.toLocaleString("en-GB")}
                    </div>
                    <div className="text-xs text-gray-500">
                      Paid: £{booking.paidAmount.toLocaleString("en-GB")}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/owner/dashboard/bookings/${booking.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>

                      {upperStatus === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 border-green-600 cursor-pointer"
                          onClick={() => onConfirm?.(booking)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                      )}

                      {canCheckIn && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 border-blue-500 cursor-pointer"
                          onClick={() => onCheckIn?.(booking.id)}
                        >
                          <LogIn className="w-4 h-4 mr-1" />
                          Check In
                        </Button>
                      )}

                      {canCheckOut && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 border-indigo-500 cursor-pointer"
                          onClick={() => onCheckOut?.(booking.id)}
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Check Out
                        </Button>
                      )}

                      {["PENDING", "CONFIRMED"].includes(upperStatus) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-600 cursor-pointer"
                          onClick={() => onCancel?.(booking.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
