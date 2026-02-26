"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";

interface Document {
  id: string;
  documentType: string;
  submittedBy: string;
  userType: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
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
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Approval</h1>
          <p className="text-gray-600 mt-1">Review and approve user documents</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Document Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Submitted By</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{doc.documentType}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{doc.submittedBy}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{doc.userType}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{doc.submittedDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          doc.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {doc.status === "approved" && <CheckCircle className="w-3 h-3" />}
                        {doc.status === "rejected" && <XCircle className="w-3 h-3" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {doc.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(doc.id)}
                            className="text-green-600"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(doc.id)}
                            className="text-red-600"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
