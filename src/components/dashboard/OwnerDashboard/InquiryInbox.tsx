// components/dashboard/OwnerDashboard/InquiryInbox.tsx
"use client";

import { Inbox, User, Clock, Star, Filter, Search, MessageSquare, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const mockInquiries = [
  {
    id: "INQ001",
    property: "Seaside Villa",
    guest: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 9876543210",
    message: "Interested in long-term rental starting March 2024 for 12 months.",
    date: "2024-01-05T10:30:00",
    status: "new", // new, read, replied, closed
    priority: "high", // high, medium, low
    type: "long_term",
    duration: "12 months",
    budget: 40000,
    source: "website",
    tags: ["serious", "flexible dates"],
    unread: true,
  },
  {
    id: "INQ002",
    property: "Urban Apartment",
    guest: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 8765432109",
    message: "Can we schedule a viewing next week? Interested in 6-month lease.",
    date: "2024-01-04T14:20:00",
    status: "replied",
    priority: "medium",
    type: "long_term",
    duration: "6 months",
    budget: 28000,
    source: "mobile_app",
    tags: ["viewing requested"],
    unread: false,
  },
  {
    id: "INQ003",
    property: "Mountain Cottage",
    guest: "Amit Patel",
    email: "amit@example.com",
    phone: "+91 7654321098",
    message: "Looking for weekend getaway for 4 people. Available next weekend?",
    date: "2024-01-03T09:15:00",
    status: "read",
    priority: "high",
    type: "short_term",
    duration: "3 nights",
    budget: 20000,
    source: "website",
    tags: ["urgent", "weekend"],
    unread: false,
  },
  {
    id: "INQ004",
    property: "Luxury Penthouse",
    guest: "Sneha Reddy",
    email: "sneha@example.com",
    phone: "+91 6543210987",
    message: "Interested in purchase. Can you share more details about amenities?",
    date: "2024-01-02T16:45:00",
    status: "closed",
    priority: "low",
    type: "purchase",
    duration: null,
    budget: 80000000,
    source: "referral",
    tags: ["purchase", "high value"],
    unread: false,
  },
];

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-800",
  replied: "bg-green-100 text-green-800",
  closed: "bg-purple-100 text-purple-800",
};

export default function InquiryInbox() {
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState(mockInquiries[0]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const markAsRead = (id: string) => {
    setInquiries(
      inquiries.map((inq) =>
        inq.id === id ? { ...inq, status: "read", unread: false } : inq
      )
    );
  };

  const replyToInquiry = (id: string) => {
    setInquiries(
      inquiries.map((inq) =>
        inq.id === id ? { ...inq, status: "replied" } : inq
      )
    );
  };

  const closeInquiry = (id: string) => {
    setInquiries(
      inquiries.map((inq) =>
        inq.id === id ? { ...inq, status: "closed" } : inq
      )
    );
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter !== "all" && inq.status !== filter) return false;
    if (search && !inq.guest.toLowerCase().includes(search.toLowerCase()) && 
        !inq.property.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = inquiries.filter((inq) => inq.unread).length;
  const newCount = inquiries.filter((inq) => inq.status === "new").length;

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Inbox className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inquiry Inbox</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {inquiries.length} total inquiries
                </span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {unreadCount} unread
                  </Badge>
                )}
                {newCount > 0 && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {newCount} new
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Quick Reply Templates
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search inquiries by guest or property..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "new", "replied", "closed"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "new" && newCount > 0 && (
                  <span className="ml-2 bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                    {newCount}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Inquiry List */}
        <div className="lg:col-span-1 border-r max-h-[600px] overflow-y-auto">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`
                p-4 border-b cursor-pointer transition-colors hover:bg-gray-50
                ${selectedInquiry.id === inquiry.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                ${inquiry.unread ? "bg-blue-50/50" : ""}
              `}
              onClick={() => {
                setSelectedInquiry(inquiry);
                markAsRead(inquiry.id);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{inquiry.guest}</span>
                  {inquiry.unread && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[inquiry.priority as keyof typeof priorityColors]}`}>
                  {inquiry.priority}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 mb-1">{inquiry.property}</h4>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{inquiry.message}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[inquiry.status as keyof typeof statusColors]}`}>
                    {inquiry.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(inquiry.date)}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-900">
                  ₹{inquiry.budget.toLocaleString()}
                  <span className="text-gray-500 ml-1">
                    {inquiry.type === "purchase" ? "" : "/" + (inquiry.type === "short_term" ? "night" : "month")}
                  </span>
                </div>
              </div>

              {inquiry.tags && inquiry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {inquiry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Inquiry Details */}
        <div className="lg:col-span-2 p-6">
          {selectedInquiry ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedInquiry.property}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-gray-600">
                      <User className="w-4 h-4" />
                      {selectedInquiry.guest}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedInquiry.date)}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedInquiry.priority as keyof typeof priorityColors]}`}>
                      {selectedInquiry.priority} priority
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => replyToInquiry(selectedInquiry.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => closeInquiry(selectedInquiry.id)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Guest Info */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Guest Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{selectedInquiry.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{selectedInquiry.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Inquiry Details</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Message</div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="font-medium">{selectedInquiry.type.replace("_", " ")}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-medium">{selectedInquiry.duration || "N/A"}</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-sm text-gray-500">Budget</div>
                      <div className="font-medium">₹{selectedInquiry.budget.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <div className="text-sm text-gray-500 mb-2">Source</div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {selectedInquiry.source}
                      </span>
                      <span className="text-sm text-gray-600">
                        • {formatDate(selectedInquiry.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Guest
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send SMS
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Create Booking
                  </Button>
                  <Button variant="outline">
                    Send Quotation
                  </Button>
                  <Button variant="outline">
                    Schedule Viewing
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Select an inquiry</h4>
              <p className="text-gray-500">Choose an inquiry from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}