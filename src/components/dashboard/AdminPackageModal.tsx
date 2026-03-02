"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface PackageData {
  id: string;
  name: string;
  tier: string;
  price: number;
  duration: string;
  propertyLimit: number;
  featuredLimit: number;
  storageLimit: number;
  dailyLeadsLimit: number;
  isActive: boolean;
  subscribers: number;
  supportLevel: string;
}

interface AdminPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PackageData>) => void;
  package?: PackageData | null;
  saving?: boolean;
}

const TIERS = ["BASIC", "STANDARD", "PREMIUM", "ENTERPRISE"];
const DURATIONS = ["monthly", "quarterly", "yearly"];
const SUPPORT_LEVELS = ["standard", "priority", "vip"];

export default function AdminPackageModal({
  isOpen,
  onClose,
  onSave,
  package: pkg,
  saving = false,
}: AdminPackageModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    tier: "BASIC",
    price: 0,
    duration: "monthly",
    propertyLimit: 3,
    featuredLimit: 1,
    storageLimit: 10,
    dailyLeadsLimit: 5,
    isActive: true,
    supportLevel: "standard",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        tier: pkg.tier,
        price: pkg.price,
        duration: pkg.duration,
        propertyLimit: pkg.propertyLimit,
        featuredLimit: pkg.featuredLimit,
        storageLimit: pkg.storageLimit,
        dailyLeadsLimit: pkg.dailyLeadsLimit,
        isActive: pkg.isActive,
        supportLevel: pkg.supportLevel,
      });
    } else {
      setFormData({
        name: "",
        tier: "BASIC",
        price: 0,
        duration: "monthly",
        propertyLimit: 3,
        featuredLimit: 1,
        storageLimit: 10,
        dailyLeadsLimit: 5,
        isActive: true,
        supportLevel: "standard",
      });
    }
    setError("");
  }, [pkg, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Package name is required");
      return;
    }
    if (formData.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg rounded-[5px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {pkg ? "Edit Package" : "Create Package"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Starter Pack"
                  className="rounded-[5px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier *
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => handleChange("tier", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)}
                  placeholder="299"
                  className="rounded-[5px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Level
                </label>
                <select
                  value={formData.supportLevel}
                  onChange={(e) => handleChange("supportLevel", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {SUPPORT_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Package Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Limit
                  </label>
                  <Input
                    type="number"
                    value={formData.propertyLimit}
                    onChange={(e) => handleChange("propertyLimit", parseInt(e.target.value) || 0)}
                    className="rounded-[5px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Limit
                  </label>
                  <Input
                    type="number"
                    value={formData.featuredLimit}
                    onChange={(e) => handleChange("featuredLimit", parseInt(e.target.value) || 0)}
                    className="rounded-[5px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage (GB)
                  </label>
                  <Input
                    type="number"
                    value={formData.storageLimit}
                    onChange={(e) => handleChange("storageLimit", parseInt(e.target.value) || 0)}
                    className="rounded-[5px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Leads Limit
                  </label>
                  <Input
                    type="number"
                    value={formData.dailyLeadsLimit}
                    onChange={(e) => handleChange("dailyLeadsLimit", parseInt(e.target.value) || 0)}
                    className="rounded-[5px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Package is active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-[5px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px]"
              >
                {saving ? "Saving..." : pkg ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
