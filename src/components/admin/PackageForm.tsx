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
        await api.post("/api/admin/packages", form);
      } else {
        await api.patch(`/api/admin/packages/${initialData!.id}`, form);
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Basic Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="name">Package Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder='e.g. "Pro 3-Month"'
              required
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={form.shortDescription ?? ""}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="One-line teaser shown on package card"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Optional detailed description"
            />
          </div>
        </div>
      </section>

      {/* Pricing & duration */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Pricing & Duration</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="price">Price (£) *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="durationValue">Duration Value *</Label>
            <Input
              id="durationValue"
              type="number"
              min={1}
              value={form.durationValue}
              onChange={(e) => set("durationValue", parseInt(e.target.value) || 1)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="durationUnit">Duration Unit *</Label>
            <Select
              value={form.durationUnit}
              onValueChange={(v) => set("durationUnit", v as DurationUnit)}
            >
              <SelectTrigger id="durationUnit">
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
        <p className="text-sm text-gray-500">
          Example: value=10, unit=days → package expires 10 days after purchase
        </p>
      </section>

      {/* Limits */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Listing Limits</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="propertyLimit">Property Limit (0 = unlimited)</Label>
            <Input
              id="propertyLimit"
              type="number"
              min={0}
              value={form.propertyLimit ?? 1}
              onChange={(e) => set("propertyLimit", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="featuredLimit">Featured Slots</Label>
            <Input
              id="featuredLimit"
              type="number"
              min={0}
              value={form.featuredLimit ?? 0}
              onChange={(e) => set("featuredLimit", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </section>

      {/* Feature flags */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Feature Flags</h2>
        <div className="space-y-3">
          {FEATURE_FLAGS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <Switch
                checked={!!form[key]}
                onCheckedChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium text-gray-900">Active</p>
          <p className="text-sm text-gray-500">Owners can see and purchase this package</p>
        </div>
        <Switch
          checked={!!form.isActive}
          onCheckedChange={(v) => set("isActive", v)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create Package" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
