"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminAmenityFilterModal from "@/components/dashboard/AdminAmenityFilterModal";
import AdminAmenityModal from "@/components/dashboard/AdminAmenityModal";
import AdminAmenityList from "@/components/dashboard/AdminAmenityList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface Amenity {
  id: string;
  name: string;
  icon: string;
  propertiesUsing: number;
  status: "active" | "inactive";
  category?: string;
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [amenityModalOpen, setAmenityModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [saving, setSaving] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ status: "ALL", usageLevel: "ALL" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("pageSize", "100");
      if (searchTerm) params.append("search", searchTerm);
      const response = await api.get(`/amenities?${params.toString()}`);
      if (response.data?.success && response.data?.data) {
        const items = (response.data.data.items || response.data.data).map((a: any) => ({
          id: a.id,
          name: a.name,
          icon: a.icon || "Sparkles",
          propertiesUsing: a.propertyCount || 0,
          status: "active" as const,
          category: a.category,
        }));
        setAmenities(items);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchAmenities(); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredAmenities = amenities.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      appliedFilters.status === "ALL" ||
      (appliedFilters.status === "ACTIVE" && a.status === "active") ||
      (appliedFilters.status === "INACTIVE" && a.status === "inactive");
    let matchesUsage = true;
    if (appliedFilters.usageLevel !== "ALL") {
      const c = a.propertiesUsing;
      if (appliedFilters.usageLevel === "HIGH" && c < 200) matchesUsage = false;
      if (appliedFilters.usageLevel === "MEDIUM" && (c < 50 || c >= 200)) matchesUsage = false;
      if (appliedFilters.usageLevel === "LOW" && c >= 50) matchesUsage = false;
    }
    return matchesSearch && matchesStatus && matchesUsage;
  });

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/amenities/${id}`);
      setAmenities((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting amenity:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveAmenity = async (data: { name: string; category: string; icon: string }) => {
    setSaving(true);
    try {
      if (editingAmenity) {
        const response = await api.put(`/amenities/${editingAmenity.id}`, data);
        if (response.data?.success) {
          setAmenities((prev) =>
            prev.map((a) => a.id === editingAmenity.id ? { ...a, ...data } : a)
          );
        }
      } else {
        const response = await api.post("/amenities", data);
        if (response.data?.success && response.data?.data) {
          setAmenities((prev) => [...prev, {
            id: response.data.data.id,
            name: data.name,
            icon: data.icon,
            propertiesUsing: 0,
            status: "active",
            category: data.category,
          }]);
        }
      }
      setAmenityModalOpen(false);
      setEditingAmenity(null);
    } catch (err) {
      console.error("Error saving amenity:", err);
    } finally {
      setSaving(false);
    }
  };

  const removeFilter = (key: string) => setAppliedFilters((prev) => ({ ...prev, [key]: "ALL" }));
  const hasFilters = appliedFilters.status !== "ALL" || appliedFilters.usageLevel !== "ALL";

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Amenities Management</h1>
            <p className="text-gray-600 text-sm mt-0.5">Manage property amenities across the platform</p>
          </div>
          <Button
            onClick={() => { setEditingAmenity(null); setAmenityModalOpen(true); }}
            className="bg-green-600 hover:bg-green-700 text-white rounded-[5px] cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Amenity
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white border rounded-[5px] p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search amenities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-[5px]"
              />
            </div>
            <Button variant="outline" onClick={() => setFilterModalOpen(true)} className="rounded-[5px]">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Filters:</span>
              {appliedFilters.status !== "ALL" && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2.5 py-1 rounded-[5px]">
                  {appliedFilters.status}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("status")} />
                </Badge>
              )}
              {appliedFilters.usageLevel !== "ALL" && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2.5 py-1 rounded-[5px]">
                  {appliedFilters.usageLevel} Usage
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("usageLevel")} />
                </Badge>
              )}
              <Button size="sm" variant="ghost" onClick={() => setAppliedFilters({ status: "ALL", usageLevel: "ALL" })} className="text-xs text-gray-500 cursor-pointer">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <AdminAmenityList
          amenities={filteredAmenities}
          loading={loading}
          onEdit={(amenity) => { setEditingAmenity(amenity); setAmenityModalOpen(true); }}
          onDelete={(id) => setDeleteConfirm(id)}
        />

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm rounded-[5px] p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Amenity</h2>
              <p className="text-gray-600 text-sm mb-5">
                Are you sure you want to delete this amenity? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} className="rounded-[5px]">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="rounded-[5px]">
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Modal */}
        <AdminAmenityFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          filters={appliedFilters}
          onApplyFilters={(f) => setAppliedFilters(f)}
          onResetFilters={() => setAppliedFilters({ status: "ALL", usageLevel: "ALL" })}
        />

        {/* Add/Edit Modal */}
        <AdminAmenityModal
          isOpen={amenityModalOpen}
          onClose={() => { setAmenityModalOpen(false); setEditingAmenity(null); }}
          onSave={handleSaveAmenity}
          amenity={editingAmenity}
          saving={saving}
        />
      </div>
    </AdminDashboardLayout>
  );
}
