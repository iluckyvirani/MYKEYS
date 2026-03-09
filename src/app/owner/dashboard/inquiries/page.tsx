"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InquiryInbox from "@/components/dashboard/OwnerDashboard/InquiryInbox";
import { OwnerInquiryFilterModal } from "@/components/dashboard/UserDashboard/FilterModal";
import { Inbox, Clock, AlertCircle, TrendingUp, CheckCircle, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InquiryStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
  converted: number;
  highPriority: number;
}

export default function OwnerInquiriesPage() {
  const [stats, setStats] = useState<InquiryStats>({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    closed: 0,
    converted: 0,
    highPriority: 0,
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ status?: string; priority?: string; type?: string }>({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/inquiries?forOwner=true&pageSize=100");
      if (response.data?.success && response.data.data?.items) {
        const inquiries = response.data.data.items;
        const stats: InquiryStats = {
          total: inquiries.length,
          new: inquiries.filter((inq: any) => inq.status === "NEW").length,
          read: inquiries.filter((inq: any) => inq.status === "READ").length,
          replied: inquiries.filter((inq: any) => inq.status === "REPLIED").length,
          closed: inquiries.filter((inq: any) => inq.status === "CLOSED").length,
          converted: inquiries.filter((inq: any) => inq.status === "CONVERTED").length,
          highPriority: inquiries.filter((inq: any) => inq.priority === "high").length,
        };
        setStats(stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <DashboardLayout defaultRole="owner">
      {/* Main Content */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inquiries Management</h1>
            <p className="text-gray-600 mt-2">
              Manage and respond to property inquiries from potential guests
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setFilterModalOpen(true)}
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            {(appliedFilters.status || appliedFilters.priority || appliedFilters.type) && (
              <span className="ml-1 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded-full">
                {[appliedFilters.status, appliedFilters.priority, appliedFilters.type].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Applied Filter Chips */}
        {(appliedFilters.status || appliedFilters.priority || appliedFilters.type) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {appliedFilters.status && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Status: {appliedFilters.status}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setAppliedFilters(p => ({ ...p, status: undefined }))}
                />
              </Badge>
            )}
            {appliedFilters.priority && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Priority: {appliedFilters.priority}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setAppliedFilters(p => ({ ...p, priority: undefined }))}
                />
              </Badge>
            )}
            {appliedFilters.type && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Type: {appliedFilters.type.replace('_', ' ')}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setAppliedFilters(p => ({ ...p, type: undefined }))}
                />
              </Badge>
            )}
            <button
              onClick={() => setAppliedFilters({})}
              className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Inquiries</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-blue-600 font-medium">{stats.new} new</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.replied}</div>
                <div className="text-sm text-gray-600">Replied</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Waiting for guest response
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.highPriority}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Requires immediate attention
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.converted}</div>
                <div className="text-sm text-gray-600">Converted</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Successfully converted
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Inbox Component */}
      <InquiryInbox filters={appliedFilters} />

      {/* Filter Modal */}
      <OwnerInquiryFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => setAppliedFilters(filters)}
      />
    </DashboardLayout>
  );
}