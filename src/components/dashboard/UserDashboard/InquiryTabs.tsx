"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, MessageSquare, Archive } from "lucide-react";
import InquiryList from "./InquiryList";

const activeInquiries = [
  {
    id: "INQ001",
    property: "Seaside Villa, Goa",
    owner: "Rajesh Kumar",
    sent: "2024-01-05",
    lastUpdate: "2024-01-06",
    status: "responded",
    type: "long_term",
    duration: "12 months",
    budget: 40000,
    message: "Interested in long-term rental starting March 2024",
    unread: 2,
  },
  {
    id: "INQ002",
    property: "Urban Apartment, Mumbai",
    owner: "Priya Sharma",
    sent: "2024-01-04",
    lastUpdate: "2024-01-04",
    status: "pending",
    type: "long_term",
    duration: "6 months",
    budget: 28000,
    message: "Can we schedule a viewing next week?",
    unread: 0,
  },
];

const archivedInquiries = [
  {
    id: "INQ003",
    property: "Mountain Cottage, Shimla",
    owner: "Amit Patel",
    sent: "2023-12-28",
    lastUpdate: "2023-12-30",
    status: "converted",
    type: "short_term",
    duration: "5 nights",
    budget: 20000,
    message: "Weekend getaway inquiry",
    unread: 0,
  },
];

export default function InquiryTabs() {
  return (
    <div className="bg-white rounded-xl border">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-6 pt-6">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Active
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {activeInquiries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="responded" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Responded
            <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              1
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
            <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              1
            </span>
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archived
            <span className="ml-1 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
              {archivedInquiries.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="active" className="m-0">
            <InquiryList 
              inquiries={activeInquiries} 
              emptyMessage="No active inquiries. Start inquiring about properties!"
              emptyAction={{ label: "Browse Properties", href: "/properties" }}
            />
          </TabsContent>
          
          <TabsContent value="responded" className="m-0">
            <InquiryList 
              inquiries={activeInquiries.filter(i => i.status === "responded")} 
              emptyMessage="No responded inquiries yet."
              emptyAction={{ label: "View Active", href: "#" }}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="m-0">
            <InquiryList 
              inquiries={activeInquiries.filter(i => i.status === "pending")} 
              emptyMessage="No pending inquiries."
              emptyAction={{ label: "Browse Properties", href: "/properties" }}
            />
          </TabsContent>
          
          <TabsContent value="archived" className="m-0">
            <InquiryList 
              inquiries={archivedInquiries} 
              emptyMessage="No archived inquiries."
              emptyAction={{ label: "View Active", href: "#" }}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}