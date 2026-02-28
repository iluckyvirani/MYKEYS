"use client";

import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  documentType: string;
  submittedBy: string;
  userType: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
}

interface AdminDocumentListProps {
  documents: Document[];
  loading?: boolean;
  empty?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (document: Document) => void;
}

export function AdminDocumentList({
  documents,
  loading = false,
  empty = false,
  onApprove,
  onReject,
  onView,
}: AdminDocumentListProps) {
  const getStatusIcon = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "Owner":
        return "bg-blue-100 text-blue-800";
      case "User":
        return "bg-purple-100 text-purple-800";
      case "Service Provider":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading documents...</div>;
  }

  if (empty || documents.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No documents found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Document Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Submitted By
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              User Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Submitted Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {document.documentType}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{document.submittedBy}</td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getUserTypeColor(document.userType)}>
                  {document.userType}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{document.submittedDate}</td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(document.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(document.status)}
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </div>
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                {document.status === "pending" ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onApprove?.(document.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onReject?.(document.id)}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onView?.(document)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
