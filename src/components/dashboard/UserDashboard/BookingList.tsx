"use client";

import { Calendar, MapPin, Users, DollarSign, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Link from "next/link";

interface Booking {
  id: string;
  property: string;
  type: string;
  dates: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: string;
  guests: number;
  nights: number;
  actions: string[];
}

interface BookingListProps {
  bookings: Booking[];
  emptyMessage: string;
  emptyAction?: {
    label: string;
    href: string;
  };
}

export default function BookingList({ bookings, emptyMessage, emptyAction }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        {emptyAction && (
          <Button asChild className="mt-4">
            <Link href={emptyAction.href}>{emptyAction.label}</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="p-6 border rounded-[5px] hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Property Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.property}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {booking.dates}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Check-in</div>
                  <div className="font-medium">{formatDate(booking.checkIn)}</div>
                  <div className="text-xs text-gray-500">After 2:00 PM</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Check-out</div>
                  <div className="font-medium">{formatDate(booking.checkOut)}</div>
                  <div className="text-xs text-gray-500">Before 11:00 AM</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Stay</div>
                  <div className="font-medium">{booking.nights} nights</div>
                  <div className="text-xs text-gray-500">{booking.type.replace("_", " ")}</div>
                </div>
              </div>
            </div>

            {/* Amount and Actions */}
            <div className="lg:w-64">
              <div className="text-right mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(booking.amount)}
                </div>
                <div className="text-sm text-gray-600">Total amount</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {booking.actions.includes("view") && (
                  <Button asChild variant="outline" size="sm" className="flex-1 cursor-pointer rounded-[5px]">
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      View Details
                    </Link>
                  </Button>
                )}
                {booking.actions.includes("cancel") && (
                  <Button variant="outline" size="sm" className="flex-1 cursor-pointer rounded-[5px]">
                    Cancel
                  </Button>
                )}
                {booking.actions.includes("modify") && (
                  <Button variant="outline" size="sm" className="flex-1 cursor-pointer rounded-[5px]">
                    Modify
                  </Button>
                )}
                {booking.actions.includes("review") && (
                  <Button size="sm" className="flex-1 cursor-pointer rounded-[5px]">
                    Write Review
                  </Button>
                )}
                {booking.actions.includes("rebook") && (
                  <Button size="sm" className="flex-1 cursor-pointer rounded-[5px]">
                    Rebook
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}