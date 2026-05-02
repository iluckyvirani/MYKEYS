// components/dashboard/UserDashboard/InquiryList.tsx
"use client";

import { MessageSquare, User, Calendar, Clock, CheckCircle, XCircle, ArrowRight, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface Inquiry {
  id: string;
  propertyId?: string;
  property: string;
  owner: string;
  sent: string;
  lastUpdate: string;
  status: string;
  type: string;
  duration: string | null;
  budget: number;
  message: string;
  unread: number;
  response?: string | null;
}

interface InquiryListProps {
  inquiries: Inquiry[];
  emptyMessage: string;
  emptyAction?: {
    label: string;
    href: string;
  };
}

export default function InquiryList({ inquiries, emptyMessage, emptyAction }: InquiryListProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(inquiries[0]?.id || null);

  const getStatusConfig = (status: string) => {
    const normalized = (status || "").toLowerCase();

    switch (normalized) {
      case "new":
      case "read":
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" };
      case "replied":
        return { color: "bg-blue-100 text-blue-800", icon: MessageSquare, label: "Replied" };
      case "converted":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Converted" };
      case "reviewed":
        return { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Reviewed" };
      case "interested":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Interested" };
      case "rejected":
        return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" };
      case "closed":
        return { color: "bg-gray-100 text-gray-800", icon: Archive, label: "Closed" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Unknown" };
    }
  };

  const getTimeAgo = (date: string) => {
    try {
      const now = new Date();
      const past = new Date(date);
      
      // Check if date is valid
      if (isNaN(past.getTime())) {
        return "Recently";
      }
      
      const diffMs = now.getTime() - past.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDate(date);
    } catch (error) {
      return "Recently";
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        {emptyAction && (
          <Button asChild className="mt-4">
            <Link href={emptyAction.href}>{emptyAction.label}</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Inquiries List */}
      <div className="lg:col-span-1 space-y-4">
        {inquiries.map((inquiry) => {
          const statusConfig = getStatusConfig(inquiry.status);
          const StatusIcon = statusConfig.icon;
          const isSelected = selectedInquiry === inquiry.id;

          return (
            <div
              key={inquiry.id}
              onClick={() => setSelectedInquiry(inquiry.id)}
              className={`
                p-4 rounded-[5px] border cursor-pointer transition-all
                ${isSelected 
                  ? "border-green-500 bg-green-50" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{inquiry.property}</h4>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3 inline mr-1" />
                  {statusConfig.label}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <User className="w-4 h-4" />
                    {inquiry.owner}
                  </div>
                  <div className="text-gray-500">{getTimeAgo(inquiry.sent)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">
                    {inquiry.budget > 0 ? formatCurrency(inquiry.budget) : "Price not available"}
                    {inquiry.budget > 0 && (
                      <span className="text-gray-500 text-xs ml-1">
                        {inquiry.type === "buy" ? "total" : "/month"}
                      </span>
                    )}
                  </div>
                  {inquiry.duration && (
                    <div className="text-sm text-gray-600">{inquiry.duration}</div>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                  {inquiry.message}
                </p>

                {/* {inquiry.unread > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-600">
                      {inquiry.unread} new message{inquiry.unread > 1 ? "s" : ""}
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inquiry Details */}
      <div className="lg:col-span-2">
        {selectedInquiry ? (
          (() => {
            const inquiry = inquiries.find(i => i.id === selectedInquiry);
            if (!inquiry) return null;
            
            const statusConfig = getStatusConfig(inquiry.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div className="bg-white rounded-[5px] border p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{inquiry.property}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-gray-600">
                        <User className="w-4 h-4" />
                        {inquiry.owner}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Sent {formatDate(inquiry.sent)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4 inline mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  <Link href={inquiry.propertyId ? `/property/${inquiry.propertyId}` : "#"} className="ml-4">
                    <Button variant="outline">
                      View Property
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Inquiry Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Inquiry Type</div>
                    <div className="font-medium">{inquiry.type.replace("_", " ")}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Duration</div>
                    <div className="font-medium">{inquiry.duration || "Flexible"}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Property Rent</div>
                    <div className="font-medium">£{inquiry.budget}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                    <div className="font-medium">{getTimeAgo(inquiry.lastUpdate)}</div>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Message</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{inquiry.message}</p>
                  </div>
                </div>

                {/* Owner's Response */}
                {inquiry.response && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Owner's Response</h4>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-gray-700">{inquiry.response}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  {inquiry.status === "pending" && (
                    <Button variant="outline" className="text-red-600 hover:text-red-700 cursor-pointer rounded-[5px]">
                      Withdraw Inquiry
                    </Button>
                  )}
                  {inquiry.status === "approved" && (
                    <Button className="bg-green-600 hover:bg-green-700 flex-1 cursor-pointer rounded-[5px]">
                      Proceed to Booking
                    </Button>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an inquiry</h3>
            <p className="text-gray-500">Choose an inquiry from the list to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}