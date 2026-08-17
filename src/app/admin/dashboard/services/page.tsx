"use client";

import { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Wrench, Loader2, X } from "lucide-react";

type Category = { id: string; name: string };
type CatalogRow = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  commissionPercent: number;
  isActive: boolean;
  categoryId: string;
  category?: { id: string; name: string };
  _count?: { offeredBy: number; bookings: number };
};

const emptyForm = {
  name: "",
  description: "",
  price: "50",
  commissionPercent: "10",
  categoryId: "",
  isActive: true,
};

export default function AdminCatalogServicesPage() {
  const [items, setItems] = useState<CatalogRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [svcRes, catRes] = await Promise.all([
        api.get("/admin/catalog-services"),
        api.get("/admin/categories"),
      ]);
      setItems(svcRes.data?.data ?? []);
      setCategories(catRes.data?.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  function openEdit(row: CatalogRow) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      description: row.description ?? "",
      price: String(row.price),
      commissionPercent: String(row.commissionPercent),
      categoryId: row.categoryId,
      isActive: row.isActive,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        commissionPercent: Number(form.commissionPercent),
        categoryId: form.categoryId,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/admin/catalog-services/${editingId}`, payload);
      } else {
        await api.post("/admin/catalog-services", payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this catalog service? If it has bookings it will be deactivated instead.")) {
      return;
    }
    try {
      await api.delete(`/admin/catalog-services/${id}`);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  }

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-green-600" />
              Catalog Services
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Define services with fixed tenant price and MYKEYS commission. Providers only mark which they offer.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            disabled={categories.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </div>

        {categories.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Create a service category first under Admin → Service Categories.
          </div>
        )}

        <div className="relative max-w-sm">
          <Input
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white"
          />
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 border border-dashed rounded-xl bg-white">
            No catalog services yet. Add your first service.
          </div>
        ) : (
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Commission</th>
                  <th className="px-4 py-3 font-medium">Providers</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((row) => {
                  const commissionAmt = (row.price * row.commissionPercent) / 100;
                  const providerCut = row.price - commissionAmt;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{row.name}</p>
                        {row.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[220px]">
                            {row.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold">£{row.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.commissionPercent}%
                        <span className="block text-xs text-gray-400">
                          MYKEYS £{commissionAmt.toFixed(2)} · Pro £{providerCut.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{row._count?.offeredBy ?? 0}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            row.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleDelete(row.id)}
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
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSave}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Service" : "Add Catalog Service"}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="e.g. Boiler repair"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tenant price (£) *</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>MYKEYS commission (%) *</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={form.commissionPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, commissionPercent: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-gray-500">Visible for booking & provider offers</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Create service"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
