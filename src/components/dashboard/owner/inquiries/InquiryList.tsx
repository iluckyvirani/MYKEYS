"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreVertical,
  Loader,
  AlertCircle,
  Home,
  Mail,
  MapPin,
} from "lucide-react";

interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  message: string;
  status: string;
  ownerResponse?: string;
  createdAt: string;
  priority?: string;
}

interface InquiryListProps {
  inquiries: Inquiry[];
  loading?: boolean;
  empty?: boolean;
  onReply?: (inquiry: Inquiry) => void;
}

export function InquiryList({
  inquiries,
  loading = false,
  empty = false,
  onReply,
}: InquiryListProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "new":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "New",
        };
      case "read":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          label: "Read",
        };
      case "replied":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          label: "Replied",
        };
      case "closed":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: "Closed",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: status || "Unknown",
        };
    }
  };

  const getPriorityConfig = (priority?: string) => {
    const normalizedPriority = priority?.toLowerCase() || "normal";
    switch (normalizedPriority) {
      case "high":
        return { color: "text-red-700 bg-red-50", label: "High" };
      case "medium":
        return { color: "text-orange-700 bg-orange-50", label: "Medium" };
      case "low":
        return { color: "text-green-700 bg-green-50", label: "Low" };
      default:
        return { color: "text-gray-700 bg-gray-50", label: "Normal" };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-green-600" />
          <span className="text-gray-600">Loading inquiries...</span>
        </div>
      </div>
    );
  }

  if (empty || inquiries.length === 0) {
    return (
      <div className="bg-white rounded-[5px] border py-12 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-gray-900 font-semibold mb-1">No inquiries found</h3>
        <p className="text-gray-500 text-sm">
          You don't have any inquiries for your properties yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => {
        const statusConfig = getStatusConfig(inquiry.status);
        const priorityConfig = getPriorityConfig(inquiry.priority);

        return (
          <div
            key={inquiry.id}
            className="bg-white rounded-[5px] border p-6 hover:border-green-300 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{inquiry.guestName}</h3>
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  {inquiry.priority && (
                    <Badge variant="outline" className={`${priorityConfig.color} border-0`}>
                      {priorityConfig.label} Priority
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                  <a href={`mailto:${inquiry.guestEmail}`} className="flex items-center gap-1 hover:text-green-600">
                    <Mail className="w-4 h-4" />
                    {inquiry.guestEmail}
                  </a>
                  <a href={`tel:${inquiry.guestPhone}`} className="hover:text-green-600">
                    {inquiry.guestPhone || "No phone"}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <Link
                    href={`/owner/dashboard/properties/${inquiry.propertyId}`}
                    className="hover:text-green-600 font-medium"
                  >
                    {inquiry.propertyTitle}
                  </Link>
                </div>

                <p className="text-gray-700 mb-3">{inquiry.message}</p>

                {inquiry.ownerResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-[5px] p-3 mt-3">
                    <p className="text-xs font-medium text-green-700 mb-1">YOUR RESPONSE</p>
                    <p className="text-sm text-gray-900">{inquiry.ownerResponse}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/owner/dashboard/inquiries/${inquiry.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!inquiry.ownerResponse && (
                      <DropdownMenuItem onClick={() => onReply?.(inquiry)}>
                        Reply to Inquiry
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onReply?.(inquiry)}>
                      {inquiry.ownerResponse ? "Edit Response" : "Add Response"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-3 border-t">
              Received on {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
