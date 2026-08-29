"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Package, Users, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";

interface PackageRow {
  id: string;
  name: string;
  price: number;
  durationValue: number;
  durationUnit: string;
  propertyLimit: number;
  featuredLimit: number;
  isActive: boolean;
  category?: "SALE" | "RENT";
  audience?: "OWNER" | "AGENT";
  shortDescription?: string;
  showOwnerName: boolean;
  showOwnerPhone: boolean;
  directInquiryToOwner: boolean;
  adminCCOnInquiry: boolean;
  fullAdminSupport: boolean;
  docExpiryAlert: boolean;
}

function formatDuration(v: number, u: string) {
  return `${v} ${v === 1 ? u.replace(/s$/, '') : u}`;
}

export default function AdminPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [audienceTab, setAudienceTab] = useState<"OWNER" | "AGENT">("OWNER");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/packages");
      setPackages(res.data?.data ?? []);
    } catch {
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/admin/packages/${id}`);
      setDeleteConfirm(null);
      await fetchPackages();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? err.message ?? "Failed to delete package");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = packages.filter((p) =>
    (p.audience ?? "OWNER") === audienceTab &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = packages.filter((p) => p.isActive).length;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-600" /> Package Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage Sale and Rent subscription packages for owners and agents
            </p>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            onClick={() => router.push(`/admin/dashboard/packages/new?audience=${audienceTab}`)}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Package
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Packages", value: packages.length, icon: Package, color: "blue" },
            { label: "Active Packages", value: activeCount, icon: CheckCircle, color: "green" },
            { label: "Inactive", value: packages.length - activeCount, icon: XCircle, color: "gray" },
            { label: "Subscribers", value: "—", icon: Users, color: "purple" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Audience tabs */}
        <div className="flex gap-2">
          {(["OWNER", "AGENT"] as const).map((tab) => (
            <Button
              key={tab}
              variant={audienceTab === tab ? "default" : "outline"}
              className={audienceTab === tab ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setAudienceTab(tab)}
            >
              {tab === "OWNER" ? "Owner packages" : "Agent packages"}
            </Button>
          ))}
        </div>

        {/* Search & Table */}
        <Card className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search packages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No packages found.</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => router.push("/admin/dashboard/packages/new")}
              >
                Create your first package
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Listings</th>
                    <th className="pb-3 pr-4 font-medium">Features</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((pkg) => {
                    const featureCount = [
                      pkg.showOwnerName, pkg.showOwnerPhone, pkg.directInquiryToOwner,
                      pkg.adminCCOnInquiry, pkg.fullAdminSupport, pkg.docExpiryAlert,
                    ].filter(Boolean).length;
                    return (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">{pkg.name}</p>
                          {pkg.shortDescription && (
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{pkg.shortDescription}</p>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={
                              pkg.category === "SALE"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-teal-100 text-teal-700"
                            }
                          >
                            {pkg.category === "SALE" ? "Sale" : "Rent"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          £{pkg.price}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {formatDuration(pkg.durationValue, pkg.durationUnit)}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {pkg.propertyLimit === 0 ? "Unlimited" : pkg.propertyLimit}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-gray-600">{featureCount} / 6 on</span>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                            {pkg.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/dashboard/packages/${pkg.id}/edit`)}
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => { setDeleteConfirm(pkg.id); setDeleteError(""); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Delete Package</h2>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete this package? This cannot be undone.
              </p>
              {deleteError && (
                <p className="text-sm text-red-600 bg-red-50 rounded p-2">{deleteError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
