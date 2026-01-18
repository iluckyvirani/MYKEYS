// components/dashboard/UserDashboard/ActiveInquiries.tsx
"use client";

import { MessageSquare, Clock, CheckCircle, XCircle, User, Home, Building2, TrendingUp, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useState } from "react";

// Updated mock data according to your business model
const mockInquiries = [
  {
    id: "INQ001",
    property: "3BHK Apartment, Mumbai",
    propertyId: "PROP001",
    owner: "Rajesh Kumar",
    ownerPhone: "+91 98765 43210",
    sentDate: "2024-01-02",
    lastUpdate: "2024-01-03",
    status: "sent", // sent, viewed, responded, negotiating, rejected, contacted
    type: "long_rent", // long_rent OR buy
    moveInDate: "2024-03-01",
    duration: "12 months", // Only for long_rent
    userMessage: "Interested in renting this property starting March 2024. Can we schedule a viewing?",
    userPhone: "+91 98765 43210", // User's phone for owner to contact
    userName: "Amit Sharma", // User's name
    unreadMessages: 0, // No messaging system in your model
    priority: "high",
    propertyType: "apartment",
    monthlyRent: "₹45,000", // For long_rent
    totalPrice: null, // For buy
    // Additional fields
    viewingScheduled: false,
    ownerResponded: false,
    canContactOwner: true, // Direct contact allowed
  },
  {
    id: "INQ002",
    property: "Luxury Villa, Delhi",
    propertyId: "PROP002",
    owner: "Priya Sharma",
    ownerPhone: "+91 98765 43211",
    sentDate: "2024-01-01",
    lastUpdate: "2024-01-01",
    status: "responded",
    type: "buy", // Changed to buy
    moveInDate: null, // Not for purchase
    duration: null, // Not for purchase
    userMessage: "Interested in buying this property. Please share more details.",
    userPhone: "+91 98765 43211",
    userName: "Priya Sharma",
    unreadMessages: 0,
    priority: "high",
    propertyType: "villa",
    monthlyRent: null,
    totalPrice: "₹2.5 Cr",
    viewingScheduled: true,
    ownerResponded: true,
    canContactOwner: true,
  },
  {
    id: "INQ003",
    property: "Studio Apartment, Bangalore",
    propertyId: "PROP003",
    owner: "Amit Patel",
    ownerPhone: "+91 98765 43212",
    sentDate: "2023-12-28",
    lastUpdate: "2023-12-30",
    status: "contacted", // Owner has contacted user
    type: "long_rent",
    moveInDate: "2024-02-15",
    duration: "6 months",
    userMessage: "Looking for 6-month rental starting Feb 2024",
    userPhone: "+91 98765 43212",
    userName: "Amit Patel",
    unreadMessages: 0,
    priority: "medium",
    propertyType: "studio",
    monthlyRent: "₹25,000",
    totalPrice: null,
    viewingScheduled: true,
    ownerResponded: true,
    canContactOwner: true,
  },
  {
    id: "INQ004",
    property: "Commercial Space, Pune",
    propertyId: "PROP004",
    owner: "Sneha Reddy",
    ownerPhone: "+91 98765 43213",
    sentDate: "2023-12-25",
    lastUpdate: "2023-12-27",
    status: "rejected",
    type: "buy",
    moveInDate: null,
    duration: null,
    userMessage: "Inquiry for purchasing commercial property",
    userPhone: "+91 98765 43213",
    userName: "Sneha Reddy",
    unreadMessages: 0,
    priority: "low",
    propertyType: "commercial",
    monthlyRent: null,
    totalPrice: "₹1.8 Cr",
    viewingScheduled: false,
    ownerResponded: true,
    canContactOwner: false,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "contacted":
      return Phone;
    case "responded":
      return MessageSquare;
    case "negotiating":
      return TrendingUp;
    case "rejected":
      return XCircle;
    case "viewed":
      return CheckCircle;
    default:
      return Clock; // sent
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "long_rent":
      return Building2;
    case "buy":
      return TrendingUp;
    default:
      return Home;
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

const getStatusText = (status: string) => {
  switch (status) {
    case "sent":
      return "Sent to Owner";
    case "viewed":
      return "Viewed by Owner";
    case "responded":
      return "Owner Responded";
    case "contacted":
      return "Owner Contacted You";
    case "negotiating":
      return "Negotiating";
    case "rejected":
      return "Rejected";
    default:
      return "Sent";
  }
};

export default function ActiveInquiries() {
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [filter, setFilter] = useState<string>("all"); // all, long_rent, buy

  const filteredInquiries = filter === "all" 
    ? inquiries 
    : inquiries.filter(inquiry => inquiry.type === filter);

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

  const handleContactOwner = (phone: string, inquiryId: string) => {
    // Update status to contacted when user calls
    setInquiries(prev => prev.map(inq => 
      inq.id === inquiryId ? { ...inq, status: "contacted", lastUpdate: new Date().toISOString().split('T')[0] } : inq
    ));
    window.open(`tel:${phone}`, '_blank');
  };

  const handleWithdrawInquiry = (inquiryId: string) => {
    if (window.confirm("Are you sure you want to withdraw this inquiry?")) {
      setInquiries(prev => prev.filter(inq => inq.id !== inquiryId));
    }
  };

  const handleMarkAsContacted = (inquiryId: string) => {
    setInquiries(prev => prev.map(inq => 
      inq.id === inquiryId ? { ...inq, status: "contacted", lastUpdate: new Date().toISOString().split('T')[0] } : inq
    ));
  };

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Property Inquiries</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track responses for long-term rentals and property purchases
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter buttons */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "all" ? "bg-white shadow" : ""}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("long_rent")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "long_rent" ? "bg-white shadow" : ""}`}
            >
              Long Rent
            </button>
            <button
              onClick={() => setFilter("buy")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "buy" ? "bg-white shadow" : ""}`}
            >
              Purchase
            </button>
          </div>
          
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Inquiries Yet</h4>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            You haven't sent any inquiries for long-term rentals or property purchases.
          </p>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            Browse Properties
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const StatusIcon = getStatusIcon(inquiry.status);
            const TypeIcon = getTypeIcon(inquiry.type);
            
            return (
              <div
                key={inquiry.id}
                className={`p-4 rounded-lg border hover:bg-gray-50 transition-colors ${getPriorityColor(inquiry.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      inquiry.type === "long_rent" ? "bg-blue-50 text-blue-600" : 
                      inquiry.type === "buy" ? "bg-purple-50 text-purple-600" : 
                      "bg-gray-50 text-gray-600"
                    }`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-medium text-gray-900">{inquiry.property}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {getStatusText(inquiry.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry.type === "long_rent" ? "bg-blue-100 text-blue-700" : 
                            "bg-purple-100 text-purple-700"
                          }`}>
                            {inquiry.type === "long_rent" ? "Long Term Rent" : "Property Purchase"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          Owner: {inquiry.owner}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inquiry.propertyType.charAt(0).toUpperCase() + inquiry.propertyType.slice(1)}
                        </div>
                        {inquiry.type === "long_rent" ? (
                          <div className="text-sm font-medium text-blue-600">
                            ₹{inquiry.monthlyRent}/month
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-purple-600">
                            {inquiry.totalPrice}
                          </div>
                        )}
                        {inquiry.duration && (
                          <div className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {inquiry.duration}
                          </div>
                        )}
                      </div>

                      {/* User's Message (Small message sent to owner) */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500">Your Message to Owner:</span>
                          <span className="text-xs text-gray-500">{getTimeAgo(inquiry.sentDate)}</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          "{inquiry.userMessage}"
                        </p>
                        <div className="text-xs text-gray-500 mt-2">
                          Sent from: {inquiry.userName} • {inquiry.userPhone}
                        </div>
                      </div>

                      {/* Status Updates */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          Inquiry ID: {inquiry.id} • Sent {getTimeAgo(inquiry.sentDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          {inquiry.viewingScheduled && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Viewing Scheduled
                            </span>
                          )}
                          {inquiry.ownerResponded && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Owner Responded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 min-w-[120px]"
                    onClick={() => window.location.href = `/property/${inquiry.propertyId}`}
                  >
                    View Property
                  </Button>
                  {inquiry.status === "responded" && !inquiry.viewingScheduled && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 min-w-[120px] bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      onClick={() => handleMarkAsContacted(inquiry.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Contacted
                    </Button>
                  )}
                  
                  {inquiry.status === "sent" && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleWithdrawInquiry(inquiry.id)}
                    >
                      Withdraw Inquiry
                    </Button>
                  )}
                </div>

                {/* Owner Contact Info (Visible when owner has responded) */}
                {inquiry.status === "responded" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Owner Contact Information:</span>
                      <span className="text-xs text-blue-600">Click to contact directly</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{inquiry.owner}</span>
                      </div>
                      <a 
                        href={`tel:${inquiry.ownerPhone}`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{inquiry.ownerPhone}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm">
            <span className="font-medium text-blue-700">Inquiry Stats:</span> 
            <span className="ml-2">
              {inquiries.filter(i => i.type === "long_rent").length} Long Rent • 
              {inquiries.filter(i => i.type === "buy").length} Purchase
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Long Rent Inquiry</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs">Purchase Inquiry</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Contacted</span>
            </div>
          </div>
        </div>
        
        {/* Quick Tips */}
        <div className="mt-3 text-xs text-blue-600">
          <span className="font-medium">Tip:</span> Owners typically respond within 24-48 hours. 
          Follow up with a direct call if no response after 2 days.
        </div>
      </div>
    </div>
  );
}