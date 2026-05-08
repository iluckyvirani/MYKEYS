"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import PackageForm from "@/components/admin/PackageForm";

export default function NewPackagePage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Package</h1>
          <p className="text-gray-500 text-sm mt-1">
            Define a new subscription package for Long Rent &amp; Buy property owners
          </p>
        </div>
        <PackageForm mode="create" />
      </div>
    </AdminDashboardLayout>
  );
}
