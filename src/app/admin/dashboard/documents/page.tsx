"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminDocumentFilterModal } from "@/components/dashboard/admin/documents/AdminDocumentFilterModal";
import { AdminDocumentList } from "@/components/dashboard/admin/documents/AdminDocumentList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, X, FileCheck, Clock, CheckCircle, XCircle } from "lucide-react";

interface Document {
  id: string;
  documentType: string;
  submittedBy: string;
  userType: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: "1",
        documentType: "Aadhar Card",
        submittedBy: "Rajesh Kumar",
        userType: "Owner",
        submittedDate: "2025-02-15",
        status: "pending",
      },
      {
        id: "2",
        documentType: "PAN Card",
        submittedBy: "Priya Singh",
        userType: "User",
        submittedDate: "2025-02-14",
        status: "approved",
      },
      {
        id: "3",
        documentType: "Property Registration Certificate",
        submittedBy: "Suresh Sharma",
        userType: "Owner",
        submittedDate: "2025-02-13",
        status: "pending",
      },
      {
        id: "4",
        documentType: "Driving License",
        submittedBy: "Anita Patel",
        userType: "Service Provider",
        submittedDate: "2025-02-12",
        status: "approved",
      },
      {
        id: "5",
        documentType: "Passport",
        submittedBy: "Vikram Reddy",
        userType: "User",
        submittedDate: "2025-02-11",
        status: "rejected",
      },
    ];
    setDocuments(mockDocuments);
    setLoading(false);
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !appliedFilters.status || doc.status === appliedFilters.status;
    const matchesDocType = !appliedFilters.documentType || doc.documentType === appliedFilters.documentType;
    const matchesUserType = !appliedFilters.userType || doc.userType === appliedFilters.userType;
    return matchesSearch && matchesStatus && matchesDocType && matchesUserType;
  });

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

  const handleApprove = (id: string) => {
    setDocuments(documents.map((doc) =>
      doc.id === id ? { ...doc, status: "approved" as const } : doc
    ));
  };

  const handleReject = (id: string) => {
    setDocuments(documents.map((doc) =>
      doc.id === id ? { ...doc, status: "rejected" as const } : doc
    ));
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
              Filters
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
                  className="text-red-600 hover:text-red-700"
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
