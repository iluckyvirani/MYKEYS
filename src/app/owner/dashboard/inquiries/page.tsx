"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Filter,
  Search,
  Loader,
  AlertCircle,
} from "lucide-react";
import { InquiryFilterModal } from "@/components/dashboard/owner/inquiries/InquiryFilterModal";
import { InquiryList } from "@/components/dashboard/owner/inquiries/InquiryList";
import { InquiryReplyModal } from "@/components/dashboard/owner/inquiries/InquiryReplyModal";
import { api } from "@/lib/api";


interface Inquiry {
  id: string;
  type: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  message: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
  };
  status: string;
  priority?: string;
  createdAt: string;
  ownerResponse?: string;
}

interface InquiryFilters {
  propertyId?: string;
  status?: string;
  search?: string;
}

interface Stats {
  total: number;
  new: number;
  pendingResponse: number;
  closed: number;
}

export default function OwnerInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    pendingResponse: 0,
    closed: 0,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<InquiryFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Reply modal states
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("forOwner", "true");

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (filters.propertyId) {
        params.append("propertyId", filters.propertyId);
      }

      if (filters.status) {
        params.append("status", filters.status);
      }

      const response = await api.get(`/api/inquiries?${params.toString()}`);

      if (response.data.success) {
        const allInquiries = response.data.data || [];
        setInquiries(allInquiries);

        // Calculate stats
        const statsData = {
          total: allInquiries.length,
          new: allInquiries.filter((i: Inquiry) => i.status === "NEW").length,
          pendingResponse: allInquiries.filter(
            (i: Inquiry) => i.status === "READ" && !i.ownerResponse
          ).length,
          closed: allInquiries.filter((i: Inquiry) => i.status === "CLOSED")
            .length,
        };

        setStats(statsData);
      }
    } catch (err: any) {
      console.error("Error fetching inquiries:", err);
      setError(
        err.response?.data?.message || "Failed to fetch inquiries"
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Handle reply submission
  const handleReplySubmit = async (response: string) => {
    if (!selectedInquiry) return;

    try {
      setSubmitting(true);

      const patchResponse = await api.patch(
        `/api/inquiries/${selectedInquiry.id}`,
        {
          status: "REPLIED",
          ownerResponse: response,
        }
      );

      if (patchResponse.data.success) {
        // Update local inquiry state
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === selectedInquiry.id
              ? {
                  ...inq,
                  status: "REPLIED",
                  ownerResponse: response,
                }
              : inq
          )
        );

        setReplyModalOpen(false);
        setSelectedInquiry(null);
      }
    } catch (err: any) {
      console.error("Error submitting reply:", err);
      alert(err.response?.data?.message || "Failed to submit reply");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening reply modal
  const handleOpenReply = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setReplyModalOpen(true);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  // Get unique properties for filter modal
  const uniqueProperties = Array.from(
    new Map(inquiries.map(i => [i.property.id, i.property])).values()
  ).map(p => ({ id: p.id, title: p.title }));

  const hasActiveFilters =
    searchQuery || filters.propertyId || filters.status;

  // Transform inquiries for InquiryList component
  const transformedInquiries = inquiries.map(inq => ({
    id: inq.id,
    propertyId: inq.propertyId,
    propertyTitle: inq.property.title,
    guestName: inq.guestName,
    guestEmail: inq.guestEmail,
    guestPhone: inq.guestPhone || "",
    message: inq.message,
    status: inq.status,
    ownerResponse: inq.ownerResponse,
    createdAt: inq.createdAt,
    priority: inq.priority,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-600 mt-2">
          Manage and respond to property inquiries from potential guests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-600">
              Pending Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {stats.pendingResponse}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inquiries</CardTitle>
              <CardDescription>
                Showing {inquiries.length} inquiries
                {hasActiveFilters && " (filtered)"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterModal(true)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-gray-600"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by guest name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[5px] flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-green-600 animate-spin" />
              <p className="text-gray-600 mt-3">Loading inquiries...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && inquiries.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No inquiries found
              </h3>
              <p className="text-gray-600">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "You don't have any inquiries yet"}
              </p>
            </div>
          )}

          {/* Inquiries List */}
          {!loading && inquiries.length > 0 && (
            <InquiryList
              inquiries={transformedInquiries}
              onReply={(inq) => handleOpenReply(inquiries.find(original => original.id === inq.id))}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <InquiryFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setShowFilterModal(false);
        }}
        properties={uniqueProperties}
        appliedFilters={filters}
      />

      {selectedInquiry && (
        <InquiryReplyModal
          isOpen={replyModalOpen}
          onClose={() => {
            setReplyModalOpen(false);
            setSelectedInquiry(null);
          }}
          onSubmit={handleReplySubmit}
          inquiry={{
            id: selectedInquiry.id,
            guestName: selectedInquiry.guestName,
            guestEmail: selectedInquiry.guestEmail,
            message: selectedInquiry.message,
            existingResponse: selectedInquiry.ownerResponse,
            createdAt: selectedInquiry.createdAt,
          }}
          loading={submitting}
        />
      )}
    </div>
  );
}