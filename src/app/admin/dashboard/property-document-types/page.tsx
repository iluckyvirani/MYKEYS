"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  CalendarDays,
} from "lucide-react";
import { api } from "@/lib/api";

interface DocTypeRow {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  requireIssueDate: boolean;
  requireExpiryDate: boolean;
  appliesTo: string[];
  isActive: boolean;
  sortOrder: number;
  _count: { propertyDocuments: number };
}

const APPLIES_LABELS: Record<string, string> = {
  ALL: "All",
  BUY: "Buy",
  RENT_LONG: "Long Rent",
  RENT_SHORT: "Short Rent",
};

export default function AdminPropertyDocumentTypesPage() {
  const router = useRouter();
  const [types, setTypes] = useState<DocTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/property-document-types");
      setTypes(res.data?.data ?? []);
    } catch {
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/admin/property-document-types/${id}`);
      setDeleteConfirm(null);
      await fetchTypes();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to delete";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = types.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = types.filter((t) => t.isActive).length;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Property Document Types
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Define what documents owners must upload per property before
              publishing.
            </p>
          </div>
          <Button
            onClick={() =>
              router.push(
                "/admin/dashboard/property-document-types/new"
              )
            }
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" /> New Document Type
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{types.length}</p>
            <p className="text-sm text-gray-500">Total Types</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-gray-500">Active</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {types.filter((t) => t.isRequired).length}
            </p>
            <p className="text-sm text-gray-500">Required</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search document types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {search
                ? "No document types match your search."
                : "No document types yet. Create one to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Applies To
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                      Required
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                      Issue Date
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                      Expiry Date
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                      Uploads
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((dt) => (
                    <tr key={dt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{dt.name}</p>
                        {dt.description && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                            {dt.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {dt.appliesTo.length === 0 ? (
                            <Badge variant="secondary">All</Badge>
                          ) : (
                            dt.appliesTo.map((a) => (
                              <Badge key={a} variant="outline" className="text-xs">
                                {APPLIES_LABELS[a] ?? a}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {dt.isRequired ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {dt.requireIssueDate ? (
                          <CalendarDays className="w-4 h-4 text-blue-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {dt.requireExpiryDate ? (
                          <CalendarDays className="w-4 h-4 text-orange-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {dt._count.propertyDocuments}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={
                            dt.isActive
                              ? "bg-green-100 text-green-800 border-0"
                              : "bg-gray-100 text-gray-500 border-0"
                          }
                        >
                          {dt.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/dashboard/property-document-types/${dt.id}/edit`
                              )
                            }
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setDeleteConfirm(dt.id);
                              setDeleteError("");
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Delete confirm dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <Card className="max-w-sm w-full p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                Delete Document Type?
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone. If owners have already uploaded
                this document type, deletion will be blocked.
              </p>
              {deleteError && (
                <p className="text-sm text-red-600 bg-red-50 rounded p-2">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
