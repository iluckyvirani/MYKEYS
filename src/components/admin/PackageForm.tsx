"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { PackageInput, DurationUnit } from "@/types/package";

interface PackageFormProps {
  initialData?: Partial<PackageInput & { id: string }>;
  mode: "create" | "edit";
}

const FEATURE_FLAGS: { key: keyof PackageInput; label: string; description: string }[] = [
  { key: "showOwnerName",        label: "Show Owner Name",           description: "Owner full name shown on listing" },
  { key: "showOwnerPhone",       label: "Show Owner Phone",          description: "Owner phone number shown on listing" },
  { key: "directInquiryToOwner", label: "Direct Inquiry to Owner",   description: "Inquiries go directly to owner" },
  { key: "adminCCOnInquiry",     label: "Admin CC on Inquiry",       description: "Admin also receives every inquiry" },
  { key: "fullAdminSupport",     label: "Full Admin Support",        description: "Dedicated admin handling" },
  { key: "docExpiryAlert",       label: "Document Expiry Alert",     description: "Notify owner when property docs near expiry" },
];

export default function PackageForm({ initialData, mode }: PackageFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<PackageInput>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    price: initialData?.price ?? 0,
    durationValue: initialData?.durationValue ?? 1,
    durationUnit: (initialData?.durationUnit as DurationUnit) ?? "months",
    propertyLimit: initialData?.propertyLimit ?? 1,
    featuredLimit: initialData?.featuredLimit ?? 0,
    isActive: initialData?.isActive ?? true,
    showOwnerName: initialData?.showOwnerName ?? false,
    showOwnerPhone: initialData?.showOwnerPhone ?? false,
    directInquiryToOwner: initialData?.directInquiryToOwner ?? false,
    adminCCOnInquiry: initialData?.adminCCOnInquiry ?? false,
    fullAdminSupport: initialData?.fullAdminSupport ?? false,
    docExpiryAlert: initialData?.docExpiryAlert ?? false,
  });

  const set = (field: keyof PackageInput, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (mode === "create") {
        await api.post("/admin/packages", form);
      } else {
        await api.patch(`/admin/packages/${initialData!.id}`, form);
      }
      router.push("/admin/dashboard/packages");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to save package");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Details</h2>
        </div>
        <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Package Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder='e.g. "Pro 3-Month"'
              className="bg-gray-50 border-gray-200 focus:bg-white"
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-700">Short Description</Label>
            <Input
              id="shortDescription"
              value={form.shortDescription ?? ""}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="One-line teaser shown on package card"
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Full Description</Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Optional detailed description"
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Pricing & duration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pricing & Duration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (£) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                className="bg-gray-50 border-gray-200 focus:bg-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="durationValue" className="text-sm font-medium text-gray-700">Duration Value *</Label>
              <Input
                id="durationValue"
                type="number"
                min={1}
                value={form.durationValue}
                onChange={(e) => set("durationValue", parseInt(e.target.value) || 1)}
                className="bg-gray-50 border-gray-200 focus:bg-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="durationUnit" className="text-sm font-medium text-gray-700">Duration Unit *</Label>
              <Select
                value={form.durationUnit}
                onValueChange={(v) => set("durationUnit", v as DurationUnit)}
              >
                <SelectTrigger id="durationUnit" className="bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            💡 Example: value=10, unit=days → package expires 10 days after purchase
          </p>
        </div>
      </div>

      {/* Limits */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Listing Limits</h2>
        </div>
        <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="propertyLimit" className="text-sm font-medium text-gray-700">Property Limit <span className="text-gray-400 font-normal">(0 = unlimited)</span></Label>
            <Input
              id="propertyLimit"
              type="number"
              min={0}
              value={form.propertyLimit ?? 1}
              onChange={(e) => set("propertyLimit", parseInt(e.target.value) || 0)}
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="featuredLimit" className="text-sm font-medium text-gray-700">Featured Slots</Label>
            <Input
              id="featuredLimit"
              type="number"
              min={0}
              value={form.featuredLimit ?? 0}
              onChange={(e) => set("featuredLimit", parseInt(e.target.value) || 0)}
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Feature flags */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Feature Flags</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {FEATURE_FLAGS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
              <Switch
                checked={!!form[key]}
                onCheckedChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Active toggle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">Active</p>
          <p className="text-sm text-gray-500">Owners can see and purchase this package</p>
        </div>
        <Switch
          checked={!!form.isActive}
          onCheckedChange={(v) => set("isActive", v)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer">
          {saving ? "Saving…" : mode === "create" ? "Create Package" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
