"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Eye, Reply, Archive } from "lucide-react";

interface Inquiry {
  id: string;
  inquiryId: string;
  propertyTitle: string;
  from: string;
  subject: string;
  postedDate: string;
  status: "pending" | "replied" | "closed";
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: "1",
      inquiryId: "INQ001",
      propertyTitle: "2BHK Apartment",
      from: "Priya Singh",
      subject: "Is parking included?",
      postedDate: "2025-02-15",
      status: "pending",
    },
    {
      id: "2",
      inquiryId: "INQ002",
      propertyTitle: "Villa with Garden",
      from: "Arjun Nair",
      subject: "Pet policy inquiry",
      postedDate: "2025-02-14",
      status: "replied",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInquiries = inquiries.filter((inq) =>
    inq.inquiryId.includes(searchTerm) || inq.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquiries Management</h1>
          <p className="text-gray-600 mt-1">Manage user inquiries about properties</p>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">{inquiry.inquiryId}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        inquiry.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : inquiry.status === "replied"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{inquiry.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      From: <strong>{inquiry.from}</strong> • Property: <strong>{inquiry.propertyTitle}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Posted on {inquiry.postedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    {inquiry.status === "pending" && (
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <Reply className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
