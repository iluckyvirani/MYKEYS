"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Calendar, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BookingTabs from "@/components/dashboard/UserDashboard/BookingTabs";
import {FilterModal} from "@/components/dashboard/UserDashboard/FilterModal";

export default function BookingsPage() {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    console.log("Applied filters:", filters);
  };

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">
              Manage all your bookings and reservations
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Booking Calendar
            </Button> */}
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Bookings
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[5px] p-6 mb-5 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search bookings by property name, booking ID..."
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
            Advanced Filters
          </Button>
        </div>
        
        {/* Applied Filters Display */}
        {appliedFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {appliedFilters.status && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2">
                Status: {appliedFilters.status}
                <button 
                onClick={() => setAppliedFilters({ ...appliedFilters, status: null })} 
                className="ml-1 cursor-pointer">×</button>
              </div>
            )}
            {appliedFilters.paymentStatus && (
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-2">
                Payment: {appliedFilters.paymentStatus}
                <button onClick={() => setAppliedFilters({ ...appliedFilters, paymentStatus: null })} className="ml-1">×</button>
              </div>
            )}
            {(appliedFilters.fromDate || appliedFilters.toDate) && (
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-2">
                Date: {appliedFilters.fromDate || "Any"} to {appliedFilters.toDate || "Any"}
                <button onClick={() => setAppliedFilters({ ...appliedFilters, fromDate: null, toDate: null })} className="ml-1">×</button>
              </div>
            )}
            {appliedFilters.sortBy && appliedFilters.sortBy !== 'recent' && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-2">
                Sort: {appliedFilters.sortBy}
                <button onClick={() => setAppliedFilters({ ...appliedFilters, sortBy: 'recent' })} className="ml-1">×</button>
              </div>
            )}
            <button
              className="text-xs text-gray-500 underline hover:text-gray-700 cursor-pointer"
              onClick={() => setAppliedFilters(null)}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Booking Tabs Content */}
      <BookingTabs searchQuery={searchQuery} filters={appliedFilters || undefined} />

      {/* Filter Modal */}
      <FilterModal 
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </DashboardLayout>
  );
}