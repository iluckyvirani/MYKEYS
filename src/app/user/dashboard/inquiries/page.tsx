"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InquiryTabs from "@/components/dashboard/UserDashboard/InquiryTabs";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Inquiry, InquiryStatus, InquiryListResponse } from "@/types/inquiry";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate stats
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
            <p className="text-gray-600 mt-2">
              Track and manage all your property inquiries
            </p>
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

      {/* Filters and Search */}
      <div className="bg-white rounded-[5px] p-6 mb-5 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inquiries by property or owner..."
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
              <option>All Inquiries</option>
              <option>Active</option>
              <option>Archived</option>
              <option>By Property Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiry Tabs Content */}
      <InquiryTabs />
    </DashboardLayout>
  );
}