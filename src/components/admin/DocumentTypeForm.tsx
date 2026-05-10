"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const APPLIES_OPTIONS = [
  { value: "ALL", label: "All Property Types" },
  { value: "BUY", label: "Buy" },
  { value: "RENT_LONG", label: "Long Rent" },
  { value: "RENT_SHORT", label: "Short Rent" },
];

interface FormValues {
  name: string;
  description: string;
  isRequired: boolean;
  requireIssueDate: boolean;
  requireExpiryDate: boolean;
  appliesTo: string[];
  isActive: boolean;
  sortOrder: number;
}

interface Props {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<FormValues>;
}

const defaults: FormValues = {
  name: "",
  description: "",
  isRequired: true,
  requireIssueDate: false,
  requireExpiryDate: false,
  appliesTo: ["ALL"],
  isActive: true,
  sortOrder: 0,
};

export default function DocumentTypeForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({ ...defaults, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleAppliesTo(value: string) {
    if (value === "ALL") {
      setForm((f) => ({ ...f, appliesTo: ["ALL"] }));
      return;
    }
    setForm((f) => {
      const current = f.appliesTo.filter((v) => v !== "ALL");
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...f, appliesTo: next.length > 0 ? next : ["ALL"] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Document name is required");
      return;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        await api.post("/api/admin/property-document-types", form);
      } else {
        await api.patch(`/api/admin/property-document-types/${id}`, form);
      }
      router.push("/admin/dashboard/property-document-types");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save document type";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-700 rounded px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Document Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Gas Safety Certificate"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          placeholder="Helper text shown to the owner"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>

      {/* Applies To */}
      <div className="space-y-2">
        <Label>Applies To</Label>
        <div className="flex flex-wrap gap-2">
          {APPLIES_OPTIONS.map((opt) => {
            const active = form.appliesTo.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleAppliesTo(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400">
          Select "All Property Types" to apply to every listing.
        </p>
      </div>

      {/* Toggles */}
      <Card className="p-4 space-y-3">
        {(
          [
            { key: "isRequired", label: "Required", help: "Owner cannot publish without this document" },
            { key: "requireIssueDate", label: "Require Issue Date", help: "Owner must enter when the document was issued" },
            { key: "requireExpiryDate", label: "Require Expiry Date", help: "Owner must enter the document expiry date" },
            { key: "isActive", label: "Active", help: "Inactive types are not shown to owners" },
          ] as const
        ).map(({ key, label, help }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{help}</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
              className={`w-10 h-5 rounded-full transition-colors ${
                form[key] ? "bg-blue-600" : "bg-gray-200"
              } relative`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </Card>

      {/* Sort Order */}
      <div className="space-y-1.5">
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input
          id="sortOrder"
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
          }
          className="w-32"
        />
        <p className="text-xs text-gray-400">
          Lower numbers appear first (0 = top).
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : mode === "create" ? "Create Document Type" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push("/admin/dashboard/property-document-types")
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
