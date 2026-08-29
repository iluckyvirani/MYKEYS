"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Upload,
  KeyRound,
} from "lucide-react";

type EligibleProperty = {
  id: string;
  title: string;
  city: string;
  address: string;
  status: string;
  price: number;
  hasActiveTenancy: boolean;
};

type TenancyRow = {
  id: string;
  tenure: "SIX_MONTHS" | "TWELVE_MONTHS";
  agreementDate: string;
  endsAt: string;
  rentDueDay: number;
  monthlyRent: number | null;
  status: string;
  tenant: { id: string; name: string; email: string; phone: string };
  property: {
    id: string;
    title: string;
    city: string;
    status: string;
  };
  documents: { id: string; name: string; fileUrl: string }[];
};

type DocRow = { name: string; fileUrl: string; uploading?: boolean };

const emptyForm = {
  propertyId: "",
  tenantName: "",
  tenantEmail: "",
  tenantPhone: "",
  tenure: "TWELVE_MONTHS" as "SIX_MONTHS" | "TWELVE_MONTHS",
  agreementDate: "",
  rentDueDay: "1",
  monthlyRent: "",
};

export default function OwnerRentManagementPage() {
  const [properties, setProperties] = useState<EligibleProperty[]>([]);
  const [tenancies, setTenancies] = useState<TenancyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [docs, setDocs] = useState<DocRow[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/owner/rent");
      if (res.data?.success) {
        setTenancies(res.data.data.tenancies || []);
        setProperties(res.data.data.properties || []);
      } else {
        setError("Failed to load rent management.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load rent management.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const availableProperties = properties.filter((p) => !p.hasActiveTenancy);

  const onSelectProperty = (propertyId: string) => {
    const prop = properties.find((p) => p.id === propertyId);
    setForm((f) => ({
      ...f,
      propertyId,
      monthlyRent: prop ? String(prop.price) : f.monthlyRent,
    }));
  };

  const addDocRow = () => setDocs((d) => [...d, { name: "", fileUrl: "" }]);

  const updateDoc = (index: number, patch: Partial<DocRow>) => {
    setDocs((list) =>
      list.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const removeDoc = (index: number) => {
    setDocs((list) => list.filter((_, i) => i !== index));
  };

  const uploadDoc = async (index: number, file: File) => {
    updateDoc(index, { uploading: true });
    try {
      const reader = new FileReader();
      const base64: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (
        !base64.startsWith("data:image/") &&
        !base64.startsWith("data:application/pdf")
      ) {
        throw new Error("Only images or PDF files are allowed.");
      }

      const res = await api.post("/upload", {
        image: base64,
        folder: "mykeys/tenant-documents",
      });
      const url = res.data?.data?.url;
      if (!url) throw new Error("Upload failed");
      updateDoc(index, {
        fileUrl: url,
        uploading: false,
        name: docs[index]?.name || file.name.replace(/\.[^.]+$/, ""),
      });
    } catch (err: any) {
      updateDoc(index, { uploading: false });
      setError(err.response?.data?.message || err.message || "Upload failed");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const documents = docs
        .filter((d) => d.name.trim() && d.fileUrl)
        .map((d) => ({ name: d.name.trim(), fileUrl: d.fileUrl }));

      const res = await api.post("/owner/rent", {
        propertyId: form.propertyId,
        tenantName: form.tenantName,
        tenantEmail: form.tenantEmail,
        tenantPhone: form.tenantPhone,
        tenure: form.tenure,
        agreementDate: form.agreementDate,
        rentDueDay: Number(form.rentDueDay),
        monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : null,
        documents,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to save");
      }

      setSuccess(
        "Tenant saved. If the property was live on the website, it is now draft and hidden."
      );
      setForm(emptyForm);
      setDocs([]);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save tenant");
    } finally {
      setSaving(false);
    }
  };

  const endTenancy = async (id: string) => {
    if (!confirm("End this tenancy?")) return;
    try {
      await api.patch(`/owner/rent/${id}`, { action: "end" });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to end tenancy");
    }
  };

  const tenureLabel = (t: string) =>
    t === "SIX_MONTHS" ? "6 months" : "12 months";

  return (
    <DashboardLayout defaultRole="agent">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rent Management</h1>
          <p className="text-gray-600 mt-1">
            Record long-term tenants manually. No package required. Live listings
            move to draft when rented.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setSuccess(null);
            setError(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#339390] text-white text-sm font-medium rounded-[5px] hover:bg-[#2a7a78]"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Close form" : "Add tenant"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[5px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-[5px] text-sm text-emerald-800">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-8 bg-white border rounded-[5px] p-5 space-y-5"
        >
          <div className="flex items-center gap-2 text-[#339390]">
            <KeyRound className="w-5 h-5" />
            <h2 className="font-semibold text-gray-900">New tenant</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long-term property
              </label>
              <select
                required
                value={form.propertyId}
                onChange={(e) => onSelectProperty(e.target.value)}
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              >
                <option value="">Select property</option>
                {availableProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {p.city} ({p.status})
                  </option>
                ))}
              </select>
              {availableProperties.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No available long-term properties (or all already have an active
                  tenant).
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant name
              </label>
              <input
                required
                value={form.tenantName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tenantName: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant email
              </label>
              <input
                required
                type="email"
                value={form.tenantEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tenantEmail: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant phone
              </label>
              <input
                required
                value={form.tenantPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tenantPhone: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent tenure
              </label>
              <select
                value={form.tenure}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tenure: e.target.value as "SIX_MONTHS" | "TWELVE_MONTHS",
                  }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              >
                <option value="SIX_MONTHS">6 months</option>
                <option value="TWELVE_MONTHS">12 months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent agreement date
              </label>
              <input
                required
                type="date"
                value={form.agreementDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, agreementDate: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent due day (1–28)
              </label>
              <input
                required
                type="number"
                min={1}
                max={28}
                value={form.rentDueDay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rentDueDay: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                On this day each month, email goes to tenant + you; notification
                to you only.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly rent (£)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.monthlyRent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlyRent: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Documents
              </label>
              <button
                type="button"
                onClick={addDocRow}
                className="text-sm text-[#339390] font-medium hover:underline"
              >
                + Add document
              </button>
            </div>
            {docs.length === 0 ? (
              <p className="text-xs text-gray-500">
                Optional — add named documents (PDF or image).
              </p>
            ) : (
              <div className="space-y-3">
                {docs.map((doc, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center border rounded-[5px] p-3"
                  >
                    <input
                      placeholder="Document name"
                      value={doc.name}
                      onChange={(e) =>
                        updateDoc(index, { name: e.target.value })
                      }
                      className="border rounded-[5px] px-3 py-2 text-sm"
                    />
                    <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer border rounded-[5px] px-3 py-2 hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      {doc.uploading
                        ? "Uploading…"
                        : doc.fileUrl
                          ? "Replace file"
                          : "Upload file"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadDoc(index, file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeDoc(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-[5px]"
                      aria-label="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="md:col-span-3 text-xs text-[#339390] hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View uploaded file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !form.propertyId}
            className="px-4 py-2.5 bg-[#339390] text-white text-sm font-medium rounded-[5px] hover:bg-[#2a7a78] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save tenant"}
          </button>
        </form>
      )}

      <div className="bg-white border rounded-[5px] overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">Your tenancies</h2>
        </div>
        {loading ? (
          <div className="p-10 animate-pulse h-40 bg-gray-50" />
        ) : tenancies.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">
            No tenants recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">Tenure</th>
                  <th className="px-4 py-3 font-medium">Due day</th>
                  <th className="px-4 py-3 font-medium">Ends</th>
                  <th className="px-4 py-3 font-medium">Rent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Docs</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {tenancies.map((t) => (
                  <tr key={t.id} className="border-t align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {t.property.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        Listing: {t.property.status}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.tenant.name}</div>
                      <div className="text-xs text-gray-500">{t.tenant.email}</div>
                      <div className="text-xs text-gray-500">{t.tenant.phone}</div>
                    </td>
                    <td className="px-4 py-3">{tenureLabel(t.tenure)}</td>
                    <td className="px-4 py-3">{t.rentDueDay}</td>
                    <td className="px-4 py-3">
                      {t.endsAt
                        ? new Date(t.endsAt).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {t.monthlyRent != null
                        ? formatCurrency(t.monthlyRent)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          t.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.documents.length === 0 ? (
                        "—"
                      ) : (
                        <ul className="space-y-1">
                          {t.documents.map((d) => (
                            <li key={d.id}>
                              <a
                                href={d.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#339390] hover:underline"
                              >
                                {d.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.status === "ACTIVE" && (
                        <button
                          type="button"
                          onClick={() => endTenancy(t.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          End
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
