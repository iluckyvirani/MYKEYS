"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  AlignLeft,
  LayoutGrid,
  ToggleLeft,
  ListOrdered,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
        checked ? "bg-green-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

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
        await api.post("/admin/property-document-types", form);
      } else {
        await api.patch(`/admin/property-document-types/${id}`, form);
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

  const toggleFields = [
    {
      key: "isRequired" as const,
      label: "Required",
      help: "Owner cannot publish without uploading this document",
    },
    {
      key: "requireIssueDate" as const,
      label: "Require Issue Date",
      help: "Owner must enter when the document was issued",
    },
    {
      key: "requireExpiryDate" as const,
      label: "Require Expiry Date",
      help: "Owner must enter the document expiry date",
    },
    {
      key: "isActive" as const,
      label: "Active",
      help: "Inactive types are hidden from owners",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-[5px] px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Basic Info ─────────────────────────────────────────── */}
      <div className="bg-white border rounded-[5px] p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b">
          <FileText className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Document Info
          </h2>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Document Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Gas Safety Certificate"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-9"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
              Description
              <span className="text-gray-400 font-normal">(optional)</span>
            </span>
          </Label>
          <Textarea
            id="description"
            placeholder="Helper text shown to the owner when uploading"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={2}
            className="resize-none text-sm"
          />
        </div>
      </div>

      {/* ── Applies To ─────────────────────────────────────────── */}
      <div className="bg-white border rounded-[5px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <LayoutGrid className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Applies To
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {APPLIES_OPTIONS.map((opt) => {
            const active = form.appliesTo.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleAppliesTo(opt.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400">
          Select &quot;All Property Types&quot; to apply to every listing.
        </p>
      </div>

      {/* ── Settings / Toggles ─────────────────────────────────── */}
      <div className="bg-white border rounded-[5px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <ToggleLeft className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Settings
          </h2>
        </div>

        <div className="divide-y">
          {toggleFields.map(({ key, label, help }) => (
            <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{help}</p>
              </div>
              <Toggle
                checked={form[key]}
                onChange={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Sort Order ─────────────────────────────────────────── */}
      <div className="bg-white border rounded-[5px] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <ListOrdered className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Display Order
          </h2>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">
            Sort Order
          </Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
            }
            className="w-32 h-9"
          />
          <p className="text-xs text-gray-400">
            Lower numbers appear first. 0 = top of the list.
          </p>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving
            ? "Saving..."
            : mode === "create"
            ? "Create Document Type"
            : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push("/admin/dashboard/property-document-types")
          }
          className="cursor-pointer"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
