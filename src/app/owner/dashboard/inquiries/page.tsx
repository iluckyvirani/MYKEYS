"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InquiryInbox from "@/components/dashboard/OwnerDashboard/InquiryInbox";
import { Inbox, Clock, AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to property inquiries from potential guests
          </p>
        </div>

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
      <InquiryInbox />
    </DashboardLayout>
  );
}