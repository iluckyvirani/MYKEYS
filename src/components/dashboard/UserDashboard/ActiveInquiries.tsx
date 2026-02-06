// components/dashboard/UserDashboard/ActiveInquiries.tsx
"use client";

import { MessageSquare, Clock, CheckCircle, XCircle, User, Home, Building2, TrendingUp, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Inquiry, InquiryStatus, LongRentInquiry, BuyInquiry, InquiryListResponse } from "@/types/inquiry";

const getStatusIcon = (status: string) => {
  switch (status) {
    case InquiryStatus.PENDING:
      return Clock;
    case InquiryStatus.REVIEWED:
      return CheckCircle;
    case InquiryStatus.INTERESTED:
      return MessageSquare;
    case InquiryStatus.REJECTED:
      return XCircle;
    case InquiryStatus.CLOSED:
      return XCircle;
    default:
      return Clock;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "LONG_RENT":
      return Building2;
    case "BUY":
      return TrendingUp;
    default:
      return Home;
  }
};

const getPriorityColor = (status: string) => {
  switch (status) {
    case InquiryStatus.PENDING:
    case InquiryStatus.REVIEWED:
      return "border-l-4 border-l-red-500";
    case InquiryStatus.INTERESTED:
      return "border-l-4 border-l-orange-500";
    case InquiryStatus.REJECTED:
    case InquiryStatus.CLOSED:
      return "border-l-4 border-l-green-500";
    default:
      return "";
  }
};

export default function ActiveInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await api.get<InquiryListResponse>("/inquiries?pageSize=10");

        if (response.data?.success && response.data.data?.items) {
          // Get only first 3-4 inquiries
          const activeInquiries = response.data.data.items.slice(0, 4);
          setInquiries(activeInquiries);
          setError(null);
        } else {
          setError("Failed to load inquiries");
        }
      } catch (err: any) {
        console.error("Error fetching inquiries:", err);
        setError(null); // Don't show error, just show empty list
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const getInquiryDisplay = (inquiry: Inquiry) => {
    const isLongRent = inquiry.inquiryType === "LONG_RENT";
    const longRentInquiry = inquiry as LongRentInquiry;
    const buyInquiry = inquiry as BuyInquiry;

    return {
      property: `Property ID: ${inquiry.propertyId.slice(0, 8)}`,
      type: isLongRent ? "long_rent" : "buy",
      duration: isLongRent ? `${longRentInquiry.desiredDurationMonths} months` : null,
      price: isLongRent ? `₹${(longRentInquiry.desiredDurationMonths * 35000).toLocaleString('en-IN')}` : `₹${buyInquiry.propertyPrice.toLocaleString('en-IN')}`,
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] shadow-sm border p-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Inquiries</h3>
            <p className="text-sm text-gray-500">Your pending property inquiries</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[5px] shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Inquiries</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

const getStatusText = (status: string) => {
  switch (status) {
    case InquiryStatus.PENDING:
      return "Pending";
    case InquiryStatus.REVIEWED:
      return "Reviewed";
    case InquiryStatus.INTERESTED:
      return "Interested";
    case InquiryStatus.REJECTED:
      return "Rejected";
    case InquiryStatus.CLOSED:
      return "Closed";
    default:
      return "Pending";
  }
};

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Inquiries</h3>
          <p className="text-sm text-gray-500">Your pending property inquiries</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-[5px] cursor-pointer" asChild>
          <Link href="/user/dashboard/inquiries">View All</Link>
        </Button>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No inquiries yet. Start exploring properties!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => {
            const StatusIcon = getStatusIcon(inquiry.status);
            const display = getInquiryDisplay(inquiry);
            const TypeIcon = getTypeIcon(display.type);

            return (
              <div
                key={inquiry.id}
                className="p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      display.type === "long_rent" ? "bg-blue-50 text-blue-600" : 
                      "bg-purple-50 text-purple-600"
                    }`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{display.property}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          inquiry.status.toLowerCase().replace('_', '')
                        )}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {getStatusText(inquiry.status)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="text-gray-600">
                          {display.type === "long_rent" ? "Long-term Rental" : "Property Purchase"}
                        </div>
                        {display.duration && (
                          <div className="text-gray-600">
                            {display.duration}
                          </div>
                        )}
                        <div className="font-medium text-gray-900">
                          {display.price}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        {inquiry.message && (
                          <p className="line-clamp-1 italic">{inquiry.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}