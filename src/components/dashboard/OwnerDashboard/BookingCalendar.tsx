// components/dashboard/OwnerDashboard/BookingCalendar.tsx
"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Home, Users, Clock, CheckCircle, XCircle, DollarSign, PoundSterling } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { api } from "@/lib/api";
import { useDashboardBase } from "@/lib/dashboard/DashboardContext";

interface Booking {
  id: string;
  property: string;
  guest: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  type: string;
  amount: number;
  guests: number;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "confirmed":
    case "CONFIRMED":
      return { color: "bg-green-100 text-green-800", icon: CheckCircle };
    case "pending":
    case "PENDING":
      return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
    case "cancelled":
    case "CANCELLED":
      return { color: "bg-red-100 text-red-800", icon: XCircle };
    default:
      return { color: "bg-gray-100 text-gray-800", icon: Clock };
  }
};

export default function BookingCalendar() {
  const router = useRouter();
  const { basePath } = useDashboardBase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/owner/bookings?pageSize=100");
      if (response.data?.success && response.data.data?.items) {
        // Transform API response to component format
        const transformedBookings = response.data.data.items.map((b: any) => ({
          id: b.id,
          property: b.propertyTitle,
          guest: b.guestName,
          checkIn: new Date(b.checkInDate),
          checkOut: new Date(b.checkOutDate),
          status: b.status?.toLowerCase() || "pending",
          type: b.bookingType || "short_term",
          amount: b.totalAmount || 0,
          guests: b.numberOfGuests || 1,
        }));
        setBookings(transformedBookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const getDayBookings = (date: Date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date <= checkOut;
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const selectedDateBookings = getDayBookings(selectedDate);

  if (error) {
    return (
      <div className="bg-white rounded-[5px] shadow-sm border p-5">
        <div className="p-4 bg-red-50 border border-red-200 rounded-[5px] text-red-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <Button size="sm" onClick={fetchBookings} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] shadow-sm border p-5">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Booking Calendar</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your property bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: new Date(monthStart).getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24"></div>
            ))}

            {days.map((day) => {
              const dayBookings = getDayBookings(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    h-24 p-2 border rounded-lg transition-all hover:bg-gray-50
                    ${isSelected ? "border-2 border-green-500 bg-green-50" : "border-gray-200"}
                    ${isCurrentDay ? "bg-blue-50 border-blue-200" : ""}
                    ${!isCurrentMonth ? "opacity-40" : ""}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`
                      font-medium
                      ${isCurrentDay ? "text-blue-600" : "text-gray-700"}
                      ${isSelected ? "text-green-700" : ""}
                    `}>
                      {format(day, "d")}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-xs font-medium bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 overflow-y-auto max-h-16">
                    {dayBookings.slice(0, 2).map((booking) => {
                      const isCheckIn = isSameDay(day, booking.checkIn);
                      const isCheckOut = isSameDay(day, booking.checkOut);
                      const statusConfig = getStatusConfig(booking.status);

                      return (
                        <div
                          key={booking.id}
                          className={`
                            text-xs p-1 rounded truncate
                            ${isCheckIn ? "bg-blue-100 text-blue-800" : isCheckOut ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}
                          `}
                          title={`${booking.property} - ${booking.guest}`}
                        >
                          <div className="font-medium truncate">
                            {booking.property}
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="w-2 h-2" />
                            {isCheckIn ? "Check-in" : isCheckOut ? "Check-out" : "Occupied"}
                          </div>
                        </div>
                      );
                    })}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h4>
              {isToday(selectedDate) && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Today
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? "s" : ""} on this day
            </p>
          </div>

          <div className="space-y-4">
            {selectedDateBookings.length > 0 ? (
              selectedDateBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;
                const isCheckIn = isSameDay(selectedDate, booking.checkIn);
                const isCheckOut = isSameDay(selectedDate, booking.checkOut);

                return (
                  <div key={booking.id} className="bg-white rounded-lg p-4 border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">{booking.property}</h5>
                        <p className="text-sm text-gray-600">{booking.guest}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          Dates
                        </div>
                        <div>
                          {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d, yyyy")}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          Guests
                        </div>
                        <div>{booking.guests} {booking.guests === 1 ? "guest" : "guests"}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <PoundSterling  className="w-4 h-4" />
                          Amount
                        </div>
                        <div className="font-medium">£{booking.amount.toLocaleString()}</div>
                      </div>
                    </div>

                    {(isCheckIn || isCheckOut) && (
                      <div className="mt-3 pt-3 border-t">
                        <div className={`text-sm font-medium ${isCheckIn ? "text-blue-600" : "text-purple-600"}`}>
                          {isCheckIn ? "🛄 Check-in today" : "🛫 Check-out today"}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push(`${basePath}/bookings/${booking.id}`)}
                      >
                        View Details
                      </Button>
                      {/* <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`${basePath}/bookings/${booking.id}`)}
                      >
                        {isCheckIn ? "Check-in" : isCheckOut ? "Check-out" : "Manage"}
                      </Button> */}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings on this day</p>
                {/* <Button variant="outline" className="mt-4">
                  Create Booking
                </Button> */}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t">
            <h5 className="font-medium text-gray-900 mb-3">Day Summary</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">
                  {selectedDateBookings.length}
                </div>
                <div className="text-sm text-gray-600">Active Stays</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">
                  {selectedDateBookings.filter(b => isSameDay(selectedDate, b.checkIn)).length}
                </div>
                <div className="text-sm text-gray-600">Check-ins</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">
                  {selectedDateBookings.filter(b => isSameDay(selectedDate, b.checkOut)).length}
                </div>
                <div className="text-sm text-gray-600">Check-outs</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">
                  £{selectedDateBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}