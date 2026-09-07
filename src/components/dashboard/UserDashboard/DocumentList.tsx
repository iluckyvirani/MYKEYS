"use client";

import { FileText, Download, Eye, Trash2, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/documents");
      if (response.data?.success && response.data?.data) {
        setDocs(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        setDocs(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (doc: Document) => {
    // Check if it's a PDF (raw type)
    const isPdf = doc.mimeType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
      // For PDFs, trigger download instead of opening
      handleDownload(doc.documentUrl, doc.fileName);
    } else {
      // For images, open in new tab
      window.open(doc.documentUrl, "_blank");
    }
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("accessToken");
      
      // Fetch the file with authentication
      const response = await fetch(url, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create download link and trigger
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await api.delete(`/documents/${id}`);
      setDocs(docs.filter(doc => doc.id !== id));
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (err: any) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document");
    } finally {
      setDeleting(false);
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
                  onClick={() => handleView(doc)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc.documentUrl, doc.fileName)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteClick(doc)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle>Delete Document</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
              {documentToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {DOCUMENT_TYPE_LABELS[documentToDelete.documentType]}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {documentToDelete.fileName}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => documentToDelete && handleDelete(documentToDelete.id)}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}