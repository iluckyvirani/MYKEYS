"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Calendar, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BookingTabs from "@/components/dashboard/UserDashboard/BookingTabs";

export default function BookingsPage() {
  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">
              Manage all your bookings and reservations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Booking Calendar
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Bookings
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 mb-8 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search bookings by property name, booking ID..."
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <select className="border rounded-lg px-4 py-2 text-sm w-full md:w-auto">
              <option>All Bookings</option>
              <option>Upcoming</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Tabs Content */}
      <BookingTabs />
    </DashboardLayout>
  );
}