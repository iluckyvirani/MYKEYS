"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface Booking {
  id: string;
  propertyTitle: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  guestName: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  onSelectDate?: (date: Date) => void;
}

export function BookingCalendar({ bookings, onSelectDate }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return date >= checkIn && date < checkOut;
    });
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return date >= checkIn && date < checkOut;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
    );
  }

  const monthName = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-200 border border-green-400"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square bg-gray-50 rounded-lg"
                ></div>
              );
            }

            const booked = isDateBooked(date);
            const isTodayDate = isToday(date);
            const dayBookings = getBookingsForDate(date);

            return (
              <div
                key={date.toISOString()}
                onClick={() => onSelectDate?.(date)}
                className={`aspect-square p-1 rounded-lg border cursor-pointer transition-colors ${
                  isTodayDate
                    ? "border-blue-400 bg-blue-50"
                    : booked
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="text-xs font-semibold text-gray-900 mb-1">
                  {date.getDate()}
                </div>
                {dayBookings.length > 0 && (
                  <div className="text-[10px] space-y-0.5">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-green-200 text-green-800 px-1 py-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis"
                        title={booking.guestName}
                      >
                        {booking.guestName.split(" ")[0]}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-gray-600 px-1">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="border-t p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No bookings to display</p>
        </div>
      )}
    </div>
  );
}
