"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import DocumentTypeForm from "@/components/admin/DocumentTypeForm";
import { FileText } from "lucide-react";

export default function NewPropertyDocumentTypePage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            New Document Type
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Define a new document type that owners must upload per property.
          </p>
        </div>
        <DocumentTypeForm mode="create" />
      </div>
    </AdminDashboardLayout>
  );
}
