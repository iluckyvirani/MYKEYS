// components/dashboard/UserDashboard/ActiveInquiries.tsx
"use client";

import { MessageSquare, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useState } from "react";

const mockInquiries = [
  {
    id: "INQ001",
    property: "Beachfront Villa, Kerala",
    owner: "Rajesh Kumar",
    sentDate: "2024-01-02",
    lastUpdate: "2024-01-03",
    status: "pending", // pending, responded, approved, rejected, negotiating
    type: "long_term",
    duration: "12 months",
    message: "Interested in long-term rental starting March 2024",
    unreadMessages: 2,
    priority: "high",
  },
  {
    id: "INQ002",
    property: "Luxury Penthouse, Delhi",
    owner: "Priya Sharma",
    sentDate: "2024-01-01",
    lastUpdate: "2024-01-01",
    status: "responded",
    type: "purchase",
    duration: null,
    message: "Can we schedule a viewing next week?",
    unreadMessages: 0,
    priority: "medium",
  },
  {
    id: "INQ003",
    property: "Studio Apartment, Bangalore",
    owner: "Amit Patel",
    sentDate: "2023-12-28",
    lastUpdate: "2023-12-30",
    status: "negotiating",
    type: "long_term",
    duration: "6 months",
    message: "Negotiating rent from ₹25,000 to ₹23,000",
    unreadMessages: 1,
    priority: "high",
  },
  {
    id: "INQ004",
    property: "Farmhouse, Pune",
    owner: "Sneha Reddy",
    sentDate: "2023-12-25",
    lastUpdate: "2023-12-27",
    status: "approved",
    type: "short_term",
    duration: "15 days",
    message: "Weekend getaway approved!",
    unreadMessages: 0,
    priority: "low",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return CheckCircle;
    case "rejected":
      return XCircle;
    case "responded":
      return MessageSquare;
    case "negotiating":
      return Clock;
    default:
      return Clock;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "border-l-4 border-l-red-500";
    case "medium":
      return "border-l-4 border-l-orange-500";
    case "low":
      return "border-l-4 border-l-green-500";
    default:
      return "";
  }
};

export default function ActiveInquiries() {
  const [inquiries] = useState(mockInquiries);

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Inquiries</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track responses from property owners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            New Inquiry
          </Button>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => {
          const StatusIcon = getStatusIcon(inquiry.status);
          
          return (
            <div
              key={inquiry.id}
              className={`p-4 rounded-lg border hover:bg-gray-50 transition-colors ${getPriorityColor(inquiry.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{inquiry.property}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        {inquiry.owner}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inquiry.type.replace("_", " ")}
                      </div>
                      {inquiry.duration && (
                        <div className="text-sm text-gray-500">
                          {inquiry.duration}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {inquiry.message}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500">
                        Sent {getTimeAgo(inquiry.sentDate)} • Updated {getTimeAgo(inquiry.lastUpdate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Send Message
                </Button>
                {inquiry.status === "pending" && (
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                    Withdraw
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">Tip:</span> Follow up within 48 hours for better response rates
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Approved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Responded</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}