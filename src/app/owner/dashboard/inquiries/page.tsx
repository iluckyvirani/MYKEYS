"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  MessageSquare, 
  Plus, 
  Filter, 
  Search, 
  Inbox, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Mail,
  Phone,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Archive,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock inquiries data
const mockInquiries = [
  {
    id: "INQ001",
    property: "Seaside Luxury Villa",
    propertyId: "PROP001",
    guest: "Rajesh Kumar",
    guestEmail: "rajesh@example.com",
    guestPhone: "+91 9876543210",
    sent: "2024-01-05T10:30:00",
    lastUpdate: "2024-01-06T14:20:00",
    status: "new", // new, read, replied, closed
    priority: "high", // high, medium, low
    type: "long_term",
    duration: "12 months",
    budget: 40000,
    message: "Interested in long-term rental starting March 2024 for 12 months. Can you share availability and any discounts for long-term stays?",
    propertyType: "villa",
    source: "website",
    channel: "direct",
    tags: ["serious", "flexible dates", "long-term"],
    unread: true,
    responseTime: "4 hours",
    followUpDate: "2024-01-07",
    assignedTo: "Self",
    notes: "Potential long-term tenant, schedule call for details",
  },
  {
    id: "INQ002",
    property: "Modern 2BHK Apartment",
    propertyId: "PROP002",
    guest: "Priya Sharma",
    guestEmail: "priya@example.com",
    guestPhone: "+91 8765432109",
    sent: "2024-01-04T14:20:00",
    lastUpdate: "2024-01-05T09:15:00",
    status: "replied",
    priority: "medium",
    type: "long_term",
    duration: "6 months",
    budget: 28000,
    message: "Can we schedule a viewing next week? Interested in 6-month lease for work assignment.",
    propertyType: "apartment",
    source: "mobile_app",
    channel: "ota",
    tags: ["viewing requested", "professional"],
    unread: false,
    responseTime: "2 hours",
    followUpDate: "2024-01-08",
    assignedTo: "Self",
    notes: "Viewing scheduled for Monday 10 AM",
  },
  {
    id: "INQ003",
    property: "Mountain View Cottage",
    propertyId: "PROP003",
    guest: "Amit Patel",
    guestEmail: "amit@example.com",
    guestPhone: "+91 7654321098",
    sent: "2024-01-03T09:15:00",
    lastUpdate: "2024-01-03T16:45:00",
    status: "read",
    priority: "high",
    type: "short_term",
    duration: "3 nights",
    budget: 20000,
    message: "Looking for weekend getaway for 4 people. Available next weekend? Need pet-friendly accommodation.",
    propertyType: "cottage",
    source: "website",
    channel: "direct",
    tags: ["urgent", "weekend", "pet-friendly"],
    unread: false,
    responseTime: "1 hour",
    followUpDate: "2024-01-04",
    assignedTo: "Self",
    notes: "Pet deposit required, check vaccination records",
  },
  {
    id: "INQ004",
    property: "Luxury Penthouse",
    propertyId: "PROP004",
    guest: "Sneha Reddy",
    guestEmail: "sneha@example.com",
    guestPhone: "+91 6543210987",
    sent: "2024-01-02T16:45:00",
    lastUpdate: "2024-01-03T11:20:00",
    status: "closed",
    priority: "low",
    type: "purchase",
    duration: null,
    budget: 80000000,
    message: "Interested in purchase. Can you share more details about amenities, parking, and building maintenance?",
    propertyType: "penthouse",
    source: "referral",
    channel: "direct",
    tags: ["purchase", "high value", "serious buyer"],
    unread: false,
    responseTime: "6 hours",
    followUpDate: null,
    assignedTo: "Self",
    notes: "Sent property documents, awaiting response",
  },
  {
    id: "INQ005",
    property: "Beachfront Bungalow",
    propertyId: "PROP005",
    guest: "Vikram Singh",
    guestEmail: "vikram@example.com",
    guestPhone: "+91 5432109876",
    sent: "2024-01-01T11:30:00",
    lastUpdate: "2024-01-01T14:00:00",
    status: "replied",
    priority: "medium",
    type: "short_term",
    duration: "7 nights",
    budget: 32000,
    message: "Family vacation planning for February. Need 3 bedrooms, beach access important.",
    propertyType: "bungalow",
    source: "website",
    channel: "ota",
    tags: ["family", "beach", "vacation"],
    unread: false,
    responseTime: "45 minutes",
    followUpDate: "2024-01-03",
    assignedTo: "Self",
    notes: "Shared availability calendar, waiting for dates confirmation",
  },
  {
    id: "INQ006",
    property: "Seaside Luxury Villa",
    propertyId: "PROP001",
    guest: "Anjali Mehta",
    guestEmail: "anjali@example.com",
    guestPhone: "+91 4321098765",
    sent: "2023-12-30T08:45:00",
    lastUpdate: "2023-12-31T10:30:00",
    status: "new",
    priority: "high",
    type: "short_term",
    duration: "10 nights",
    budget: 45000,
    message: "Planning destination wedding event, need venue for 50 guests. Please share event packages.",
    propertyType: "villa",
    source: "website",
    channel: "direct",
    tags: ["event", "wedding", "high-value"],
    unread: true,
    responseTime: "12 hours",
    followUpDate: "2024-01-02",
    assignedTo: "Self",
    notes: "High value inquiry, need to respond with event packages",
  },
];

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const statusColors = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  read: "bg-gray-100 text-gray-800 border-gray-200",
  replied: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusConfig = {
  new: { label: "New", icon: AlertCircle, color: "text-blue-600" },
  read: { label: "Read", icon: Eye, color: "text-gray-600" },
  replied: { label: "Replied", icon: CheckCircle, color: "text-green-600" },
  closed: { label: "Closed", icon: Archive, color: "text-purple-600" },
};

const sourceColors = {
  website: "bg-blue-50 text-blue-700 border-blue-200",
  mobile_app: "bg-green-50 text-green-700 border-green-200",
  referral: "bg-purple-50 text-purple-700 border-purple-200",
  social_media: "bg-pink-50 text-pink-700 border-pink-200",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
};

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(mockInquiries[0]);
  const [activeTab, setActiveTab] = useState("all");

  const filteredInquiries = inquiries.filter(inquiry => {
    // Status filter
    if (activeTab !== "all" && inquiry.status !== activeTab) return false;
    
    // Search filter
    if (search && !inquiry.guest.toLowerCase().includes(search.toLowerCase()) && 
        !inquiry.property.toLowerCase().includes(search.toLowerCase()) &&
        !inquiry.guestEmail.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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
        inq.id === id ? { ...inq, status: "replied", unread: false } : inq
      )
    );
  };

  const closeInquiry = (id: string) => {
    setInquiries(
      inquiries.map((inq) =>
        inq.id === id ? { ...inq, status: "closed", unread: false } : inq
      )
    );
  };

  const assignToSelf = (id: string) => {
    setInquiries(
      inquiries.map((inq) =>
        inq.id === id ? { ...inq, assignedTo: "Self" } : inq
      )
    );
  };

  const unreadCount = inquiries.filter((inq) => inq.unread).length;
  const newCount = inquiries.filter((inq) => inq.status === "new").length;
  const repliedCount = inquiries.filter((inq) => inq.status === "replied").length;
  const closedCount = inquiries.filter((inq) => inq.status === "closed").length;
  const readCount = inquiries.filter((inq) => inq.status === "read").length;
  const highPriorityCount = inquiries.filter((inq) => inq.priority === "high").length;

  const totalPotentialRevenue = inquiries
    .filter(inq => inq.status !== "closed")
    .reduce((sum, inq) => {
      if (inq.type === "purchase") return sum + inq.budget;
      if (inq.type === "long_term") return sum + (inq.budget * 6); // 6 months estimate
      return sum + inq.budget; // short term
    }, 0);

  const averageResponseTime = inquiries.length > 0
    ? Math.round(inquiries.reduce((sum, inq) => {
        const hours = parseInt(inq.responseTime.split(' ')[0]);
        return sum + (isNaN(hours) ? 0 : hours);
      }, 0) / inquiries.length)
    : 0;

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inquiries Management</h1>
            <p className="text-gray-600 mt-2">
              Manage and respond to property inquiries from potential guests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Quick Reply Templates
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{inquiries.length}</div>
                <div className="text-sm text-gray-600">Total Inquiries</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-blue-600 font-medium">{newCount} new</span>
              <span className="text-gray-500 ml-2">• {unreadCount} unread</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{averageResponseTime}h</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Across all inquiries
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{highPriorityCount}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Requires immediate attention
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPotentialRevenue)}</div>
                <div className="text-sm text-gray-600">Potential Revenue</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              From active inquiries
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="mt-4 bg-white rounded-[5px] border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Inquiry Status Breakdown</h3>
            <span className="text-sm text-gray-500">This month</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries({ new: newCount, read: readCount, replied: repliedCount, closed: closedCount }).map(([status, count]) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              const percentage = inquiries.length > 0 ? (count / inquiries.length) * 100 : 0;
              const Icon = config.icon;

              return (
                <div key={status} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${config.color} bg-opacity-20`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{config.label}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: config.color.split('-')[1],
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Inquiry List */}
        <div className="lg:col-span-1 space-y-2">
          {/* Filters and Search */}
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inquiries by guest, property, or email..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Inquiries
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("new")}>
                      New Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("high")}>
                      High Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("unread")}>
                      Unread Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <select 
                  className="border rounded-[5px] px-3 py-2.5 text-sm bg-white"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["all", "new", "high", "today", "unread", "replied"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => {
                    if (filterType === "all") setActiveTab("all");
                    if (filterType === "new") setActiveTab("new");
                    if (filterType === "replied") setActiveTab("replied");
                  }}
                  className={`px-3 py-1.5 text-sm rounded-[5px] border ${
                    (filterType === "all" && activeTab === "all") ||
                    (filterType === "new" && activeTab === "new") ||
                    (filterType === "replied" && activeTab === "replied")
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {filterType === "all" && "All"}
                  {filterType === "new" && `New (${newCount})`}
                  {filterType === "high" && `High Priority (${highPriorityCount})`}
                  {filterType === "today" && "Today"}
                  {filterType === "unread" && `Unread (${unreadCount})`}
                  {filterType === "replied" && `Replied (${repliedCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Inquiry List */}
          <div className="bg-white rounded-[5px] border overflow-hidden">
            <div className="border-b bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {filteredInquiries.length} inquiry{filteredInquiries.length !== 1 ? 'ies' : ''} found
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Sort by:</span>
                  <select className="text-xs border-none bg-transparent">
                    <option>Newest first</option>
                    <option>Priority</option>
                    <option>Property</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredInquiries.map((inquiry) => {
                const statusConfigItem = statusConfig[inquiry.status as keyof typeof statusConfig];
                const StatusIcon = statusConfigItem.icon;
                const isSelected = selectedInquiry.id === inquiry.id;

                return (
                  <div
                    key={inquiry.id}
                    className={`
                      p-4 cursor-pointer transition-all hover:bg-gray-50
                      ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                      ${inquiry.unread ? 'bg-blue-50/50' : ''}
                    `}
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      markAsRead(inquiry.id);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {inquiry.property}
                          </h4>
                          {inquiry.unread && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-1.5 py-0">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{inquiry.guest}</span>
                          <span className="text-xs text-gray-500">• {inquiry.guestEmail}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {inquiry.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[inquiry.priority as keyof typeof priorityColors]}`}>
                          {inquiry.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(inquiry.sent)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[inquiry.status as keyof typeof statusColors]}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusConfigItem.label}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${sourceColors[inquiry.source as keyof typeof sourceColors] || 'bg-gray-100 text-gray-800'}`}>
                          {inquiry.source.replace('_', ' ')}
                        </span>
                        {inquiry.type && (
                          <span className="text-xs text-gray-500">
                            {inquiry.type.replace('_', ' ')} • {formatCurrency(inquiry.budget)}
                            {inquiry.type !== 'purchase' && (
                              inquiry.type === 'short_term' ? '/night' : '/month'
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {inquiry.responseTime} response
                      </div>
                    </div>

                    {inquiry.tags && inquiry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
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
                );
              })}

              {filteredInquiries.length === 0 && (
                <div className="text-center py-12">
                  <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h4>
                  <p className="text-gray-500">
                    {search ? "Try a different search term" : "All inquiries are processed"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Inquiry Details */}
        <div className="space-y-6">
          {/* Selected Inquiry Details */}
          <div className="bg-white rounded-[5px] border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedInquiry.property}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    {selectedInquiry.guest}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => assignToSelf(selectedInquiry.id)}>
                      Assign to Self
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => markAsRead(selectedInquiry.id)}>
                      Mark as Read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => closeInquiry(selectedInquiry.id)}>
                      Close Inquiry
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/owner/dashboard/properties/${selectedInquiry.propertyId}`}>
                        View Property
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Guest Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Guest Information</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{selectedInquiry.guestEmail}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{selectedInquiry.guestPhone}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Call
                  </Button>
                </div>
              </div>
            </div>

            {/* Inquiry Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Inquiry Details</h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Message</div>
                  <div className="p-4 bg-gray-50 rounded-lg border whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-medium">{selectedInquiry.type.replace("_", " ")}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{selectedInquiry.duration || "N/A"}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-500">Budget</div>
                    <div className="font-medium">{formatCurrency(selectedInquiry.budget)}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-500">Source</div>
                    <div className="font-medium">{selectedInquiry.source.replace("_", " ")}</div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">Status Timeline</div>
                    <div className="text-xs text-gray-500">
                      Sent: {formatDate(selectedInquiry.sent)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedInquiry.status === 'new' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Inquiry received</span>
                      <span className="text-xs text-gray-500 ml-auto">{formatDate(selectedInquiry.sent)}</span>
                    </div>
                    {selectedInquiry.status !== 'new' && (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedInquiry.status === 'read' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm">Viewed by owner</span>
                        <span className="text-xs text-gray-500 ml-auto">{formatDate(selectedInquiry.lastUpdate)}</span>
                      </div>
                    )}
                    {selectedInquiry.status === 'replied' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Replied to guest</span>
                        <span className="text-xs text-gray-500 ml-auto">{formatDate(selectedInquiry.lastUpdate)}</span>
                      </div>
                    )}
                    {selectedInquiry.status === 'closed' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Inquiry closed</span>
                        <span className="text-xs text-gray-500 ml-auto">{formatDate(selectedInquiry.lastUpdate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Guest
                </Button>
                <Button variant="outline" className="justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Quick Reply
                </Button>
                <Button variant="outline">
                  Schedule Viewing
                </Button>
                <Button variant="outline" className="col-span-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Booking
                </Button>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white rounded-[5px] border p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Inquiry Performance</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-bold text-green-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: "92%" }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Avg. Response Time</div>
                  <div className="text-lg font-bold text-gray-900">{averageResponseTime}h</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                  <div className="text-lg font-bold text-gray-900">42%</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Today's Summary</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">+3 new</span>
                  <span className="text-gray-500">2 responded</span>
                  <span className="text-blue-600 font-medium">1 converted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}