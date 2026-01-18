// components/dashboard/UserDashboard/InquiryList.tsx
"use client";

import { MessageSquare, User, Calendar, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface Inquiry {
  id: string;
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
    switch (status) {
      case "responded":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Responded" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" };
      case "approved":
        return { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Approved" };
      case "rejected":
        return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" };
      case "negotiating":
        return { color: "bg-purple-100 text-purple-800", icon: MessageSquare, label: "Negotiating" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" };
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                p-4 rounded-xl border cursor-pointer transition-all
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
                    {formatCurrency(inquiry.budget)}
                    <span className="text-gray-500 text-xs ml-1">
                      /{inquiry.type === "short_term" ? "night" : "month"}
                    </span>
                  </div>
                  {inquiry.duration && (
                    <div className="text-sm text-gray-600">{inquiry.duration}</div>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                  {inquiry.message}
                </p>

                {inquiry.unread > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-600">
                      {inquiry.unread} new message{inquiry.unread > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
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
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
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
                  <Button variant="outline">
                    View Property
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
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
                    <div className="text-sm text-gray-600 mb-1">Budget</div>
                    <div className="font-medium">{formatCurrency(inquiry.budget)}</div>
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

                {/* Conversation Thread */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Conversation</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-4">
                          <p className="text-gray-700">Hi, I'm interested in your property. Can you share more details about availability?</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">You • {getTimeAgo(inquiry.sent)}</div>
                      </div>
                    </div>
                    
                    {inquiry.status === "responded" && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <p className="text-gray-700">Hello! Thanks for your interest. The property is available for your requested dates. Would you like to schedule a virtual tour?</p>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{inquiry.owner} • 2 hours ago</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  <Button className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </Button>
                  {inquiry.status === "pending" && (
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      Withdraw Inquiry
                    </Button>
                  )}
                  {inquiry.status === "approved" && (
                    <Button className="bg-green-600 hover:bg-green-700 flex-1">
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