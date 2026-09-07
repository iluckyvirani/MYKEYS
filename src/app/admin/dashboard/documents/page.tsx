"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminDocumentFilterModal } from "@/components/dashboard/admin/documents/AdminDocumentFilterModal";
import { AdminDocumentList } from "@/components/dashboard/admin/documents/AdminDocumentList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Filter, Download, X, FileCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Document {
  id: string;
  documentType: string;
  submittedBy: string;
  userTypes: string[];
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  documentUrl?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("pageSize", "50");
      if (searchTerm) params.append("search", searchTerm);
      if (appliedFilters.status) {
        const statusMap: { [key: string]: string } = {
          pending: "PENDING",
          approved: "VERIFIED",
          rejected: "REJECTED",
        };
        params.append("status", statusMap[appliedFilters.status] || appliedFilters.status);
      }
      if (appliedFilters.documentType) params.append("documentType", appliedFilters.documentType);
      if (appliedFilters.userType) params.append("userType", appliedFilters.userType);

      const response = await api.get(`/admin/documents?${params.toString()}`);
      if (response.data?.success && response.data?.data) {
        const apiDocs = (response.data.data.items || response.data.data).map((doc: any) => {
          // Map API status to component status
          let status: "pending" | "approved" | "rejected" = "pending";
          if (doc.status === "VERIFIED") status = "approved";
          else if (doc.status === "REJECTED") status = "rejected";

          // Format document type for display
          const docTypeMap: { [key: string]: string } = {
            PAN_CARD: "PAN Card",
            AADHAR_CARD: "Aadhar Card",
            DRIVING_LICENSE: "Driving License",
            PASSPORT: "Passport",
            VOTER_ID: "Voter ID",
            PROPERTY_LICENSE: "Property License",
            BUSINESS_LICENSE: "Business License",
            GST_CERTIFICATE: "GST Certificate",
            TAX_IDENTIFICATION: "Tax Identification",
            RENTAL_AGREEMENT_TEMPLATE: "Rental Agreement",
            // Service documents
            SERVICE_CERTIFICATE: "Service Certificate",
            SERVICE_LICENSE: "Service/Trade License",
            SERVICE_SKILL_CERTIFICATE: "Skill Certificate",
            SERVICE_EXPERIENCE_LETTER: "Experience Letter",
            SERVICE_TRAINING_CERTIFICATE: "Training Certificate",
          };

          // Map user roles for display
          const userTypeMap: { [key: string]: string } = {
            USER: "User",
            OWNER: "Owner",
            SERVICE: "Service Provider",
            ADMIN: "Admin",
          };

          const rawRoles: string[] = Array.isArray(doc.userTypes)
            ? doc.userTypes
            : doc.userType
            ? [doc.userType]
            : ["USER"];

          return {
            id: doc.id,
            documentType: docTypeMap[doc.documentType] || doc.documentType,
            submittedBy: doc.userName || "Unknown",
            userTypes: rawRoles.map((role) => userTypeMap[role] || role),
            submittedDate: doc.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
            status,
            documentUrl: doc.documentUrl,
          };
        });
        setDocuments(apiDocs);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, appliedFilters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Documents are filtered by API
  const filteredDocuments = documents;

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowAppliedFilters(Object.keys(filters).length > 0);
  };

  const handleClearFilter = (filterKey: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    setAppliedFilters(newFilters);
    setShowAppliedFilters(Object.keys(newFilters).length > 0);
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setShowAppliedFilters(false);
  };

  const handleView = async (document: Document) => {
    if (!document.documentUrl) {
      alert("Document URL not available");
      return;
    }

    // Check if document type is raw/PDF - if so, download directly
    const isRawDocument = document.documentType.toLowerCase().includes('raw');
    
    if (isRawDocument) {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem("accessToken");
        
        // Fetch the file with authentication
        const response = await fetch(document.documentUrl, {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });
        
        if (!response.ok) {
          throw new Error('Download failed');
        }
        
        // Get the content type from response
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const blob = await response.blob();
        
        // Create a new blob with explicit content type to preserve file format
        const typedBlob = new Blob([blob], { type: contentType });
        
        // Extract file extension from URL
        const urlPath = document.documentUrl.split('?')[0]; // Remove query params
        const urlParts = urlPath.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const extension = fileName.includes('.') ? fileName.split('.').pop() : 'pdf';
        
        // Create blob URL with proper type
        const blobUrl = window.URL.createObjectURL(typedBlob);
        
        // Create download link and trigger with proper extension
        const a = window.document.createElement("a");
        a.href = blobUrl;
        a.download = `${document.documentType}_${document.submittedBy}_${document.submittedDate}.${extension}`;
        window.document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Download error:", error);
        alert("Failed to download document");
      }
    } else {
      // For images and other viewable documents, open in new tab
      window.open(document.documentUrl, "_blank");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/documents/${id}`, { status: "VERIFIED" });
      setDocuments(documents.map((doc) =>
        doc.id === id ? { ...doc, status: "approved" as const } : doc
      ));
    } catch (err) {
      console.error("Error approving document:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/admin/documents/${id}`, { status: "REJECTED" });
      setDocuments(documents.map((doc) =>
        doc.id === id ? { ...doc, status: "rejected" as const } : doc
      ));
    } catch (err) {
      console.error("Error rejecting document:", err);
    }
  };

  const pendingDocuments = documents.filter((d) => d.status === "pending").length;
  const approvedDocuments = documents.filter((d) => d.status === "approved").length;
  const rejectedDocuments = documents.filter((d) => d.status === "rejected").length;
  const approvalRate = documents.length > 0 ? (approvedDocuments / documents.length * 100).toFixed(0) : 0;

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Approval</h1>
            <p className="text-gray-600 mt-2">
              Review and manage user submitted documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                <div className="text-sm text-gray-600">Total Documents</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              All submissions
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingDocuments}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Awaiting review
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{approvedDocuments}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Verified documents
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{approvalRate}%</div>
                <div className="text-sm text-gray-600">Approval Rate</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Success ratio
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-[5px] border p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search documents by type or submitter..."
                  className="pl-10 w-full rounded-[5px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* Applied Filters Display */}
          {showAppliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {appliedFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Status: {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.documentType && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Type: {appliedFilters.documentType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("documentType")}
                  />
                </Badge>
              )}
              {appliedFilters.userType && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  User: {appliedFilters.userType}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("userType")}
                  />
                </Badge>
              )}
              {Object.keys(appliedFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Document List */}
        <AdminDocumentList
          documents={filteredDocuments}
          loading={loading}
          empty={filteredDocuments.length === 0}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* Filter Modal */}
        <AdminDocumentFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
      </div>
    </AdminDashboardLayout>
  );
}
