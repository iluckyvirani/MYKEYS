"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import PackageForm from "@/components/admin/PackageForm";
import { api } from "@/lib/api";

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/admin/packages/${id}`)
      .then((res) => setPkg(res.data?.data ?? res.data))
      .catch(() => setError("Failed to load package"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Package</h1>
          <p className="text-gray-500 text-sm mt-1">
            Update this package&apos;s details and feature flags
          </p>
        </div>
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {pkg && <PackageForm mode="edit" initialData={pkg} />}
      </div>
    </AdminDashboardLayout>
  );
}
