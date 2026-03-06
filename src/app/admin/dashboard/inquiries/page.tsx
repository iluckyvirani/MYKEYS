"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import {
  Inbox,
  User,
  Filter,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Clock,
  Building,
  Home,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

interface Inquiry {
  id: string;
  inquiryId: string;
  propertyTitle: string;
  propertyOwnerId: string;
  ownerName: string;
  ownerEmail: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message: string;
  createdAt: string;
  status: "new" | "read" | "replied" | "closed" | "converted";
  priority: "low" | "medium" | "high";
  type: string;
  budget?: number;
  duration?: string;
}

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
  converted: "bg-indigo-100 text-indigo-800",
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("pageSize", "50");
      if (search) params.append("search", search);
      if (filter !== "all") {
        const statusMap: { [key: string]: string } = {
          new: "PENDING",
          read: "PENDING",
          replied: "RESPONDED",
          closed: "CLOSED",
          converted: "CONVERTED",
        };
        params.append("status", statusMap[filter] || filter.toUpperCase());
      }
      
      const response = await api.get(`/admin/inquiries?${params.toString()}`);
      if (response.data?.success && response.data?.data?.items) {
        const apiInquiries = response.data.data.items.map((inquiry: any) => {
          // Map API status to component status
          let status: "new" | "read" | "replied" | "closed" | "converted" = "new";
          if (inquiry.status === "PENDING") status = "new";
          else if (inquiry.status === "RESPONDED") status = "replied";
          else if (inquiry.status === "CLOSED") status = "closed";
          else if (inquiry.status === "CONVERTED") status = "converted";
          
          return {
            id: inquiry.id,
            inquiryId: `INQ${inquiry.id.slice(-6).toUpperCase()}`,
            propertyTitle: inquiry.propertyTitle || "Unknown Property",
            propertyOwnerId: inquiry.propertyOwnerId || "",
            ownerName: inquiry.ownerName || "Unknown Owner",
            ownerEmail: inquiry.ownerEmail || "",
            guestName: inquiry.userName || "Unknown Guest",
            guestEmail: inquiry.userEmail || "",
            guestPhone: inquiry.userPhone || "",
            message: inquiry.message || "",
            createdAt: inquiry.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
            status,
            priority: "medium" as const,
            type: inquiry.inquiryType || "general",
            budget: inquiry.budget,
            duration: inquiry.duration,
          };
        });
        setInquiries(apiInquiries);
        if (apiInquiries.length > 0 && !selectedInquiry) {
          setSelectedInquiry(apiInquiries[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Inquiries are already filtered by API
  const filteredInquiries = inquiries;

  const newCount = inquiries.filter((inq) => inq.status === "new").length;
  const unreadCount = inquiries.filter((inq) =>
    ["new", "read"].includes(inq.status)
  ).length;

  const handleStatusChange = (inquiryId: string, newStatus: Inquiry["status"]) => {
    setUpdatingId(inquiryId);
    setTimeout(() => {
      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: newStatus } : inq
        )
      );
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      setUpdatingId(null);
    }, 300);
  };

  const handlePriorityChange = (inquiryId: string, newPriority: Inquiry["priority"]) => {
    setUpdatingId(inquiryId);
    setTimeout(() => {
      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId ? { ...inq, priority: newPriority } : inq
        )
      );
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, priority: newPriority });
      }
      setUpdatingId(null);
    }, 300);
  };

  const handleSelectInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === "new") {
      handleStatusChange(inquiry.id, "read");
    }
  };

  const stats = {
    total: inquiries.length,
    new: newCount,
    unread: unreadCount,
    replied: inquiries.filter((i) => i.status === "replied").length,
    converted: inquiries.filter((i) => i.status === "converted").length,
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inquiries Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all property inquiries</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Inquiries</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                <div className="text-sm text-gray-600">New</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
                <div className="text-sm text-gray-600">Replied</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats.converted}</div>
                <div className="text-sm text-gray-600">Converted</div>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((stats.replied / stats.total) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Response Rate</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[5px] shadow-sm border">
          <div className="p-5 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Inbox className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Inquiry Inbox</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">{filteredInquiries.length} inquiries</span>
                    {newCount > 0 && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {newCount} new
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by guest, owner, or property..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {["all", "new", "read", "replied", "closed", "converted"].map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(status as any)}
                    className="rounded-[5px]"
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
            <div className="lg:col-span-1 border-r max-h-150 overflow-y-auto">
              {filteredInquiries.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm text-center py-8">No inquiries found</div>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className={`
                      p-4 border-b cursor-pointer transition-colors hover:bg-gray-50
                      ${selectedInquiry?.id === inquiry.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                      ${inquiry.status === "new" ? "bg-blue-50/50" : ""}
                    `}
                    onClick={() => handleSelectInquiry(inquiry)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">{inquiry.guestName}</span>
                        {inquiry.status === "new" && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0"></span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                          priorityColors[inquiry.priority as keyof typeof priorityColors]
                        }`}
                      >
                        {inquiry.priority}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">{inquiry.propertyTitle}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{inquiry.message}</p>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          statusColors[inquiry.status as keyof typeof statusColors]
                        }`}
                      >
                        {inquiry.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(inquiry.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Inquiry Details */}
            <div className="lg:col-span-2 p-6 max-h-150 overflow-y-auto">
              {selectedInquiry ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedInquiry.propertyTitle}</h3>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <User className="w-4 h-4" />
                        {selectedInquiry.guestName}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedInquiry.createdAt)}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          priorityColors[selectedInquiry.priority as keyof typeof priorityColors]
                        }`}
                      >
                        {selectedInquiry.priority} priority
                      </span>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      Property Owner
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedInquiry.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedInquiry.ownerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      Guest Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedInquiry.guestName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedInquiry.guestEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedInquiry.guestPhone || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Message */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Inquiry Message</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  {/* Inquiry Details */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-xs text-gray-600 mb-1">Type</div>
                      <div className="font-medium text-sm capitalize">{selectedInquiry.type.replace("_", " ")}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-xs text-gray-600 mb-1">Duration</div>
                      <div className="font-medium text-sm">{selectedInquiry.duration || "N/A"}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-xs text-gray-600 mb-1">Budget</div>
                      <div className="font-medium text-sm">
                        {selectedInquiry.budget ? `₹${selectedInquiry.budget.toLocaleString()}` : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Status and Priority Controls */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border">
                      <label className="text-xs text-gray-600 block mb-2">Status</label>
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as any)}
                        disabled={updatingId === selectedInquiry.id}
                        className="w-full px-2 py-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                      <label className="text-xs text-gray-600 block mb-2">Priority</label>
                      <select
                        value={selectedInquiry.priority}
                        onChange={(e) => handlePriorityChange(selectedInquiry.id, e.target.value as any)}
                        disabled={updatingId === selectedInquiry.id}
                        className="w-full px-2 py-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-[5px]"
                      onClick={() => setShowNotesModal(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Notes
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-[5px]">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Owner
                    </Button>
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

        {/* Notes Modal */}
        {showNotesModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-96 overflow-hidden flex flex-col rounded-[5px]">
              {/* Modal Header */}
              <div className="border-b p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Admin Notes - {selectedInquiry.propertyTitle}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Internal notes for admin team</p>
                </div>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Notes Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notes yet. Add notes for your team.</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Add Admin Note</label>
                  <textarea
                    placeholder="Type your internal note..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-[5px]">Save Note</Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-[5px]"
                    onClick={() => setShowNotesModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
