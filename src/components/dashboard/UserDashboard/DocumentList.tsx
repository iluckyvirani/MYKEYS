"use client";

import { FileText, Download, Eye, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Document, DOCUMENT_TYPE_LABELS } from "@/types/document";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "VERIFIED":
      return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Verified" };
    case "PENDING":
      return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Under Review" };
    case "REJECTED":
      return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" };
    case "EXPIRED":
      return { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Expired" };
    default:
      return { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" };
  }
};

interface DocumentListProps {
  onDocumentDeleted?: () => void;
}

export default function DocumentList({ onDocumentDeleted }: DocumentListProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<Document[]>("/documents");
      if (response.data) {
        setDocs(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      setDocs(docs.filter(doc => doc.id !== id));
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (err: any) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Documents</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {docs.length > 0 ? (
        docs.map((doc) => {
          const statusConfig = getStatusConfig(doc.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={doc.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4 md:mb-0">
                <div className="p-3 rounded-lg bg-blue-50">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {DOCUMENT_TYPE_LABELS[doc.documentType]}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Uploaded: {formatDate(doc.createdAt)}</div>
                    {doc.expiresAt && (
                      <div>Expires: {formatDate(doc.expiresAt)}</div>
                    )}
                    <div>Size: {formatFileSize(doc.fileSize)}</div>
                    {doc.verifiedNotes && doc.status === "REJECTED" && (
                      <div className="text-red-600 font-medium">
                        Reason: {doc.verifiedNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.documentUrl, "_blank")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = doc.documentUrl;
                    a.download = doc.fileName;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-500">Upload your verification documents to get started</p>
        </div>
      )}
    </div>
  );
}