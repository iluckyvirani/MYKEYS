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
  onConfirm?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

export function OwnerBookingList({
  bookings,
  loading = false,
  empty = false,
  onConfirm,
  onCancel,
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

              return (
                <tr key={booking.id} className="hover:bg-gray-50 group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center shrink-0">
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
                        {new Date(booking.checkInDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        -{" "}
                        {new Date(booking.checkOutDate).toLocaleDateString("en-IN", {
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
                      ₹{booking.totalAmount.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-gray-500">
                      Paid: ₹{booking.paidAmount.toLocaleString("en-IN")}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {booking.status?.toUpperCase() === "PENDING" && (
                            <DropdownMenuItem onClick={() => onConfirm?.(booking.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Booking
                            </DropdownMenuItem>
                          )}
                          {["PENDING", "CONFIRMED"].includes(
                            booking.status?.toUpperCase() || ""
                          ) && (
                            <DropdownMenuItem onClick={() => onCancel?.(booking.id)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Booking
                            </DropdownMenuItem>
                          )}
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
    </div>
  );
}
