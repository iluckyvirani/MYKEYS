"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InquiryTabs from "@/components/dashboard/UserDashboard/InquiryTabs";

export default function InquiriesPage() {
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
          <Button className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            New Inquiry
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Total Inquiries</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-sm text-gray-600">Responded</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-blue-600">4</div>
          <div className="text-sm text-gray-600">Converted to Booking</div>
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