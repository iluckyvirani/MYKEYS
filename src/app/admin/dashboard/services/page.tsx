"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import Link from "next/link";
import { api } from "@/lib/api";
import { ImageUploadField } from "@/components/admin/content/ImageUploadField";
import {
  computeServicePaymentSummary,
  type ServiceCheckoutFees,
} from "@/lib/services/serviceCheckoutFees";
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  Loader2,
  X,
  Search,
  PoundSterling,
  Percent,
  Info,
} from "lucide-react";

type Category = { id: string; name: string };
type CatalogRow = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  commissionPercent: number;
  morningSurcharge?: number;
  afternoonSurcharge?: number;
  eveningSurcharge?: number;
  isActive: boolean;
  categoryId: string;
  category?: { id: string; name: string };
  _count?: { offeredBy: number; bookings: number };
};

const emptyForm = {
  name: "",
  description: "",
  image: "",
  price: "50",
  commissionPercent: "10",
  morningSurcharge: "0",
  afternoonSurcharge: "0",
  eveningSurcharge: "0",
  categoryId: "",
  isActive: true,
};

const COMMISSION_PRESETS = [5, 10, 15, 20];
const DESCRIPTION_MAX = 280;

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number.isFinite(n) ? n : 0);
}

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
  const [checkoutFees, setCheckoutFees] = useState<ServiceCheckoutFees>({
    taxPercent: 0,
    bookingFee: 0,
    extraLabel: "",
    extraAmount: 0,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [svcRes, catRes, settingsRes] = await Promise.all([
        api.get("/admin/catalog-services"),
        api.get("/admin/categories"),
        api.get("/admin/settings").catch(() => null),
      ]);
      const catalogData = svcRes.data?.data;
      const categoryData = catRes.data?.data;
      setItems(Array.isArray(catalogData) ? catalogData : catalogData?.items ?? []);
      setCategories(
        Array.isArray(categoryData) ? categoryData : categoryData?.items ?? []
      );
      const settings = settingsRes?.data?.data ?? settingsRes?.data;
      if (settings) {
        setCheckoutFees({
          taxPercent: Number(settings.serviceTaxPercent) || 0,
          bookingFee: Number(settings.serviceBookingFee) || 0,
          extraLabel: String(settings.serviceExtraFeeLabel || ""),
          extraAmount: Number(settings.serviceExtraFeeAmount) || 0,
        });
      }
    } catch {
      setItems([]);
      setCategories([]);
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
      image: row.image ?? "",
      price: String(row.price),
      commissionPercent: String(row.commissionPercent),
      morningSurcharge: String(row.morningSurcharge ?? 0),
      afternoonSurcharge: String(row.afternoonSurcharge ?? 0),
      eveningSurcharge: String(row.eveningSurcharge ?? 0),
      categoryId: row.categoryId,
      isActive: row.isActive,
    });
    setError("");
    setModalOpen(true);
  }

  const priceNum = Number(form.price);
  const commissionNum = Number(form.commissionPercent);
  const split = useMemo(() => {
    const price = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0;
    const pct =
      Number.isFinite(commissionNum) && commissionNum >= 0 ? commissionNum : 0;
    const mykeys = (price * pct) / 100;
    const checkout = computeServicePaymentSummary(price, checkoutFees);
    return {
      tenantPays: checkout.amountToPay,
      itemTotal: price,
      taxesAndFee: checkout.taxesAndFee,
      mykeys,
      provider: Math.max(0, price - mykeys),
      valid: price > 0 && pct >= 0 && pct <= 100,
    };
  }, [priceNum, commissionNum, checkoutFees]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    if (name.length < 2) {
      setError("Give the service a clear name, e.g. Boiler repair.");
      return;
    }
    if (!form.categoryId) {
      setError("Choose a category so providers can find this service.");
      return;
    }
    if (!split.valid) {
      setError("Enter a tenant price above £0 and a commission between 0 and 100%.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        description: form.description.trim(),
        image: form.image.trim() || null,
        price: Number(form.price),
        commissionPercent: Number(form.commissionPercent),
        morningSurcharge: Number(form.morningSurcharge) || 0,
        afternoonSurcharge: Number(form.afternoonSurcharge) || 0,
        eveningSurcharge: Number(form.eveningSurcharge) || 0,
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
    if (
      !confirm(
        "Remove this catalog service? If it already has bookings it will be deactivated instead."
      )
    ) {
      return;
    }
    try {
      await api.delete(`/admin/catalog-services/${id}`);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  }

  const filtered = items.filter(
    (i) =>
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
              Set the catalog item price and MYKEYS cut. Taxes, booking fee, and
              extra checkout lines are set in{" "}
              <Link
                href="/admin/dashboard/settings"
                className="text-green-700 font-medium hover:underline"
              >
                Platform Settings
              </Link>
              .
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            disabled={categories.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" /> Add service
          </Button>
        </div>

        {categories.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Create a service category first under Admin → Service Categories,
            then come back here to add priced services.
          </div>
        )}

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white pl-9"
          />
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed rounded-xl bg-white">
            <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-800">No catalog services yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Add a service with a fixed price. Tenants pay MYKEYS; you settle
              providers later.
            </p>
            <Button
              onClick={openCreate}
              disabled={categories.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Add first service
            </Button>
          </div>
        ) : (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b text-left text-gray-500 bg-gray-50">
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Tenant pays</th>
                    <th className="px-4 py-3 font-medium">Split</th>
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
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {row.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={row.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Wrench className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{row.name}</p>
                              {row.description && (
                                <p className="text-xs text-gray-500 truncate max-w-[220px]">
                                  {row.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.category?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {gbp(row.price)}
                          {(Number(row.morningSurcharge) > 0 ||
                            Number(row.afternoonSurcharge) > 0 ||
                            Number(row.eveningSurcharge) > 0) && (
                            <span className="block text-[11px] font-normal text-gray-400">
                              Slot +{gbp(Number(row.morningSurcharge) || 0)} / +
                              {gbp(Number(row.afternoonSurcharge) || 0)} / +
                              {gbp(Number(row.eveningSurcharge) || 0)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="text-xs text-gray-500">
                            {row.commissionPercent}% MYKEYS
                          </span>
                          <span className="block text-xs text-gray-400">
                            {gbp(commissionAmt)} platform · {gbp(providerCut)}{" "}
                            provider
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() => openEdit(row)}
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 cursor-pointer"
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
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setModalOpen(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingId ? "Edit catalog service" : "Add catalog service"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Tenants pay the listed price to MYKEYS. You settle the
                    provider later from Settle Up.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !saving && setModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/80 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6 overflow-y-auto">
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Service details
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="catalog-name">Service name</Label>
                  <Input
                    id="catalog-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    maxLength={80}
                    placeholder="e.g. Boiler repair"
                    className="h-11"
                  />
                  <p className="text-xs text-gray-400">
                    Shown to tenants when they book. Keep it short and specific.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, categoryId: v }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">
                    Providers in this category can offer this service.
                  </p>
                </div>

                <ImageUploadField
                  label="Cover image"
                  image={form.image}
                  folder="mykeys/services"
                  onUploaded={(url) => setForm((f) => ({ ...f, image: url }))}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="catalog-desc">Description</Label>
                    <span className="text-xs text-gray-400">
                      {form.description.length}/{DESCRIPTION_MAX}
                    </span>
                  </div>
                  <Textarea
                    id="catalog-desc"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        description: e.target.value.slice(0, DESCRIPTION_MAX),
                      }))
                    }
                    rows={3}
                    placeholder="What is included? Any typical duration or notes for tenants."
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-xl border bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Pricing
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="catalog-price">Item total</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="catalog-price"
                        type="number"
                        min={1}
                        step="0.01"
                        inputMode="decimal"
                        value={form.price}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, price: e.target.value }))
                        }
                        required
                        className="h-11 pl-9 bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Catalog price before tax and checkout fees.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="catalog-commission">MYKEYS commission</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="catalog-commission"
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        inputMode="decimal"
                        value={form.commissionPercent}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            commissionPercent: e.target.value,
                          }))
                        }
                        required
                        className="h-11 pl-9 bg-white"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {COMMISSION_PRESETS.map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              commissionPercent: String(pct),
                            }))
                          }
                          className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer ${
                            Number(form.commissionPercent) === pct
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-600 hover:border-green-400"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">
                    Slot extras (added to item total)
                  </p>
                  <p className="text-xs text-gray-500">
                    Each service can charge a different extra for morning,
                    afternoon, and evening. Leave 0 for no extra.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        ["morningSurcharge", "Morning"],
                        ["afternoonSurcharge", "Afternoon"],
                        ["eveningSurcharge", "Evening"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={key}>{label} extra</Label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id={key}
                            type="number"
                            min={0}
                            step="0.01"
                            value={form[key]}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, [key]: e.target.value }))
                            }
                            className="h-11 pl-9 bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-white border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <Info className="w-3.5 h-3.5" />
                    How this booking splits
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-blue-50 px-2 py-2">
                      <p className="text-[11px] text-blue-700">Amount to pay</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {gbp(split.tenantPays)}
                      </p>
                      {split.taxesAndFee > 0 && (
                        <p className="text-[10px] text-blue-600 mt-0.5">
                          incl. {gbp(split.taxesAndFee)} fees
                        </p>
                      )}
                    </div>
                    <div className="rounded-md bg-emerald-50 px-2 py-2">
                      <p className="text-[11px] text-emerald-700">MYKEYS keeps</p>
                      <p className="text-sm font-semibold text-emerald-900">
                        {gbp(split.mykeys)}
                      </p>
                    </div>
                    <div className="rounded-md bg-amber-50 px-2 py-2">
                      <p className="text-[11px] text-amber-800">Provider gets</p>
                      <p className="text-sm font-semibold text-amber-900">
                        {gbp(split.provider)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {form.isActive ? "Active — bookable" : "Inactive — hidden"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Inactive services stay in the catalog but cannot be offered
                    or booked.
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-white flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={saving}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer min-w-[140px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving
                  </>
                ) : editingId ? (
                  "Save changes"
                ) : (
                  "Create service"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
