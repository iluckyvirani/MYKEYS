"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import DocumentTypeForm from "@/components/admin/DocumentTypeForm";
import { FileText } from "lucide-react";
import { api } from "@/lib/api";

interface DocType {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  requireIssueDate: boolean;
  requireExpiryDate: boolean;
  appliesTo: string[];
  isActive: boolean;
  sortOrder: number;
}

export default function EditPropertyDocumentTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [docType, setDocType] = useState<DocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/admin/property-document-types/${id}`)
      .then((res) => setDocType(res.data?.data ?? res.data))
      .catch(() => setError("Failed to load document type"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Edit Document Type
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : docType ? (
          <DocumentTypeForm
            mode="edit"
            id={id}
            initial={{
              name: docType.name,
              description: docType.description ?? "",
              isRequired: docType.isRequired,
              requireIssueDate: docType.requireIssueDate,
              requireExpiryDate: docType.requireExpiryDate,
              appliesTo: docType.appliesTo,
              isActive: docType.isActive,
              sortOrder: docType.sortOrder,
            }}
          />
        ) : null}
      </div>
    </AdminDashboardLayout>
  );
}
