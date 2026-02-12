"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Home,
  Calendar,
  Clock,
  AlertCircle,
  Edit,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { InquiryReplyModal } from "@/components/dashboard/owner/inquiries/InquiryReplyModal";

interface InquiryDetail {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  message: string;
  type: string;
  status: string;
  priority?: string;
  createdAt: string;
  ownerResponse?: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
  };
}

export default function InquiryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch inquiry details
  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/inquiries/${inquiryId}`);

        if (response.data.success) {
          setInquiry(response.data.data);
        }
      } catch (err: any) {
        console.error("Error fetching inquiry:", err);
        setError(err.response?.data?.message || "Failed to fetch inquiry");
      } finally {
        setLoading(false);
      }
    };

    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId]);

  // Handle reply submission
  const handleReplySubmit = async (response: string) => {
    if (!inquiry) return;

    try {
      setSubmitting(true);

      const patchResponse = await api.patch(`/api/inquiries/${inquiry.id}`, {
        status: "REPLIED",
        ownerResponse: response,
      });

      if (patchResponse.data.success) {
        setInquiry((prev) =>
          prev
            ? {
                ...prev,
                status: "REPLIED",
                ownerResponse: response,
              }
            : null
        );
        setReplyModalOpen(false);
      }
    } catch (err: any) {
      console.error("Error submitting reply:", err);
      alert(err.response?.data?.message || "Failed to submit reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="text-center">
          <Clock className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading inquiry details...</p>
        </div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Inquiry</h3>
              <p className="text-sm text-red-800 mt-1">
                {error || "The inquiry could not be found"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "READ":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REPLIED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-800";
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Inquiries
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Inquiry from {inquiry.guestName}
            </h1>
            <p className="text-gray-600 mt-2">
              Property: {inquiry.property.title}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setReplyModalOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Mail className="w-4 h-4" />
              {inquiry.ownerResponse ? "Edit Response" : "Send Response"}
            </Button>
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(inquiry.status)}`}>
            {inquiry.status.charAt(0) + inquiry.status.slice(1).toLowerCase()}
          </span>
          {inquiry.priority && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(inquiry.priority)}`}>
              {inquiry.priority.charAt(0) + inquiry.priority.slice(1).toLowerCase()} Priority
            </span>
          )}
        </div>
      </div>

      {/* Guest Information */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <a
                  href={`mailto:${inquiry.guestEmail}`}
                  className="font-semibold text-gray-900 hover:text-green-600"
                >
                  {inquiry.guestEmail}
                </a>
              </div>
            </div>

            {inquiry.guestPhone && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <a
                    href={`tel:${inquiry.guestPhone}`}
                    className="font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {inquiry.guestPhone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Property</div>
                <Link
                  href={`/owner/dashboard/properties/${inquiry.propertyId}`}
                  className="font-semibold text-gray-900 hover:text-purple-600"
                >
                  {inquiry.property.title}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Sent On</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(inquiry.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Message */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Message</CardTitle>
          <CardDescription>The original inquiry message</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gray-50 rounded-lg border whitespace-pre-wrap text-gray-900">
            {inquiry.message}
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Details */}
      <Card>
        <CardHeader>
          <CardTitle>Inquiry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Inquiry Type</div>
              <div className="font-semibold text-gray-900">
                {inquiry.type.replace("_", " ")}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className={`inline-block px-2 py-1 rounded text-sm font-medium border ${getStatusColor(inquiry.status)}`}>
                {inquiry.status.charAt(0) + inquiry.status.slice(1).toLowerCase()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Response Section */}
      {inquiry.ownerResponse ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-900">Your Response</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyModalOpen(true)}
                className="gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
            <CardDescription className="text-green-800">
              You have already replied to this inquiry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-white rounded-lg border border-green-200 whitespace-pre-wrap text-gray-900">
              {inquiry.ownerResponse}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-amber-900">No Response Yet</CardTitle>
            </div>
            <CardDescription className="text-amber-800">
              You haven't responded to this inquiry yet. Click the button above to send a response.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Reply Modal */}
      {inquiry && (
        <InquiryReplyModal
          isOpen={replyModalOpen}
          onClose={() => setReplyModalOpen(false)}
          onSubmit={handleReplySubmit}
          inquiry={{
            id: inquiry.id,
            guestName: inquiry.guestName,
            guestEmail: inquiry.guestEmail,
            message: inquiry.message,
            existingResponse: inquiry.ownerResponse,
            createdAt: inquiry.createdAt,
          }}
          loading={submitting}
        />
      )}
    </div>
  );
}
