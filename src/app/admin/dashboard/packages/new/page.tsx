"use client";

import { useSearchParams } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import PackageForm from "@/components/admin/PackageForm";
import { PackageAudience } from "@/types/package";

export default function NewPackagePage() {
  const searchParams = useSearchParams();
  const audienceParam = searchParams.get("audience");
  const audience: PackageAudience =
    audienceParam === "AGENT" ? "AGENT" : "OWNER";

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Package</h1>
          <p className="text-gray-500 text-sm mt-1">
            Define a new subscription package for{" "}
            {audience === "AGENT" ? "estate agents" : "Long Rent & Buy property owners"}
          </p>
        </div>
        <PackageForm mode="create" initialData={{ audience }} />
      </div>
    </AdminDashboardLayout>
  );
}
