"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InquiryTabs from "@/components/dashboard/UserDashboard/InquiryTabs";
import { InquiryFilterModal } from "@/components/dashboard/UserDashboard/FilterModal";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Inquiry, InquiryStatus, InquiryListResponse } from "@/types/inquiry";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => setDebouncedSearch(value), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch for stats (unfiltered)
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await api.get<InquiryListResponse>("/inquiries?pageSize=100");
        if (response.data?.success && response.data.data?.items) {
          setInquiries(response.data.data.items);
        }
      } catch (err: any) {
        console.error("Error fetching inquiries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const handleRemoveFilter = (key: string) => {
    setAppliedFilters((prev: any) => {
      if (!prev) return null;
      const next = { ...prev };
      delete next[key];
      return Object.keys(next).length > 0 ? next : null;
    });
  };

  // Calculate stats (unfiltered)
  const totalInquiries = inquiries.length;
  const respondedInquiries = inquiries.filter(i => i.status === InquiryStatus.REVIEWED).length;
  const pendingInquiries = inquiries.filter(i => i.status === InquiryStatus.NEW).length;
  const interestedInquiries = inquiries.filter(i => i.status === InquiryStatus.INTERESTED).length;

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Inquiries</h1>
            <p className="text-gray-600 mt-2">Track and manage all your property inquiries</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-gray-900">{totalInquiries}</div>
          <div className="text-sm text-gray-600">Total Inquiries</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-green-600">{respondedInquiries}</div>
          <div className="text-sm text-gray-600">Responded</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-yellow-600">{pendingInquiries}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-blue-600">{interestedInquiries}</div>
          <div className="text-sm text-gray-600">Interested in Booking</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[5px] p-6 mb-5 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inquiries by property or name..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
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

        {/* Applied Filters */}
        {appliedFilters && Object.keys(appliedFilters).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {appliedFilters.status && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2">
                Status: {appliedFilters.status}
                <button onClick={() => handleRemoveFilter("status")} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {(appliedFilters.fromDate || appliedFilters.toDate) && (
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center gap-2">
                Date: {appliedFilters.fromDate || "Any"} to {appliedFilters.toDate || "Any"}
                <button onClick={() => { handleRemoveFilter("fromDate"); handleRemoveFilter("toDate"); }} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {appliedFilters.sortBy && appliedFilters.sortBy !== "recent" && (
              <div className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full flex items-center gap-2">
                Sort: {appliedFilters.sortBy}
                <button onClick={() => handleRemoveFilter("sortBy")} className="hover:text-gray-900">
                  <X className="w-3 h-3" />
                </button>
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

      {/* Inquiry Tabs Content */}
      <InquiryTabs searchQuery={debouncedSearch} filters={appliedFilters || undefined} />

      {/* Filter Modal */}
      <InquiryFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => setAppliedFilters(filters)}
      />
    </DashboardLayout>
  );
}