"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, MessageSquare, Archive } from "lucide-react";
import InquiryList from "./InquiryList";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Inquiry, InquiryStatus, LongRentInquiry, BuyInquiry, InquiryListResponse } from "@/types/inquiry";

interface TransformedInquiry {
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

export default function InquiryTabs() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await api.get<InquiryListResponse>("/inquiries?pageSize=100");

        if (response.data?.success && response.data.data?.items) {
          setInquiries(response.data.data.items);
          setError(null);
        } else {
          setError("Failed to load inquiries");
        }
      } catch (err: any) {
        console.error("Error fetching inquiries:", err);
        setError(err.message || "Failed to fetch inquiries");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const transformInquiry = (inquiry: Inquiry): TransformedInquiry => {
    const isLongRent = inquiry.inquiryType === "LONG_RENT";
    const longRentInquiry = inquiry as LongRentInquiry;
    const buyInquiry = inquiry as BuyInquiry;

    return {
      id: inquiry.id,
      property: `Property ${inquiry.propertyId.slice(0, 8)}`, // Placeholder - property title not in response
      owner: inquiry.guestName, // Using guest name as contact person
      sent: new Date(inquiry.createdAt).toLocaleDateString("en-IN"),
      lastUpdate: new Date(inquiry.updatedAt).toLocaleDateString("en-IN"),
      status: getStatusLabel(inquiry.status),
      type: inquiry.inquiryType === "LONG_RENT" ? "long_term" : "buy",
      duration: isLongRent ? `${longRentInquiry.desiredDurationMonths} months` : null,
      budget: isLongRent ? longRentInquiry.desiredDurationMonths * 35000 : buyInquiry.propertyPrice,
      message: inquiry.message,
      unread: 0,
    };
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case InquiryStatus.PENDING:
        return "pending";
      case InquiryStatus.REVIEWED:
        return "reviewed";
      case InquiryStatus.INTERESTED:
        return "interested";
      case InquiryStatus.REJECTED:
        return "rejected";
      case InquiryStatus.CLOSED:
        return "closed";
      default:
        return "pending";
    }
  };

  // Categorize inquiries by status
  const pendingInquiries = inquiries
    .filter(i => i.status === InquiryStatus.PENDING || i.status === InquiryStatus.REVIEWED)
    .map(transformInquiry);

  const interestedInquiries = inquiries
    .filter(i => i.status === InquiryStatus.INTERESTED)
    .map(transformInquiry);

  const rejectedInquiries = inquiries
    .filter(i => i.status === InquiryStatus.REJECTED)
    .map(transformInquiry);

  const closedInquiries = inquiries
    .filter(i => i.status === InquiryStatus.CLOSED)
    .map(transformInquiry);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[5px] p-6">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-[5px] border">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-6 pt-6 py-6">
          <TabsTrigger value="pending" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <Clock className="w-4 h-4" />
            Pending
            <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              {pendingInquiries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="interested" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <CheckCircle className="w-4 h-4" />
            Interested
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {interestedInquiries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <MessageSquare className="w-4 h-4" />
            Rejected
            <span className="ml-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {rejectedInquiries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <Archive className="w-4 h-4" />
            Closed
            <span className="ml-1 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
              {closedInquiries.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="pending" className="m-0">
            <InquiryList 
              inquiries={pendingInquiries} 
              emptyMessage="No pending inquiries. Start inquiring about properties!"
              emptyAction={{ label: "Browse Properties", href: "/properties" }}
            />
          </TabsContent>
          
          <TabsContent value="interested" className="m-0">
            <InquiryList 
              inquiries={interestedInquiries} 
              emptyMessage="No interested inquiries yet."
              emptyAction={{ label: "View Pending", href: "#" }}
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="m-0">
            <InquiryList 
              inquiries={rejectedInquiries} 
              emptyMessage="No rejected inquiries."
              emptyAction={{ label: "Browse Properties", href: "/properties" }}
            />
          </TabsContent>
          
          <TabsContent value="closed" className="m-0">
            <InquiryList 
              inquiries={closedInquiries} 
              emptyMessage="No closed inquiries."
              emptyAction={{ label: "View All", href: "#" }}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}