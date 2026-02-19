"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Zap, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceBookingTabs from "@/components/dashboard/UserDashboard/ServiceBookingTabs";

export default function ServiceBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Service Bookings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all your service bookings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Book New Service
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[5px] p-6 mb-5 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by service name, provider, or booking ID..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterModalOpen(true)}
            className="w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Applied Filters */}
        {appliedFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {appliedFilters.status && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2">
                Status: {appliedFilters.status}
                <button
                  onClick={() =>
                    setAppliedFilters({
                      ...appliedFilters,
                      status: null,
                    })
                  }
                  className="ml-1"
                >
                  ×
                </button>
              </div>
            )}
            {appliedFilters.bookingType && (
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-2">
                Type: {appliedFilters.bookingType}
                <button
                  onClick={() =>
                    setAppliedFilters({
                      ...appliedFilters,
                      bookingType: null,
                    })
                  }
                  className="ml-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Service Booking Tabs */}
      <ServiceBookingTabs />
    </DashboardLayout>
  );
}
