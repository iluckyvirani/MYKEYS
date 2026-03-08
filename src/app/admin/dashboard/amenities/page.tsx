"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminAmenityFilterModal from "@/components/dashboard/AdminAmenityFilterModal";
import AdminAmenityModal from "@/components/dashboard/AdminAmenityModal";
import AdminAmenityList from "@/components/dashboard/AdminAmenityList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Sparkles,
  Users,
  TrendingUp,
  Home,
  X,
} from "lucide-react";
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

interface Stats {
  totalAmenities: number;
  activeAmenities: number;
  totalPropertyUsage: number;
  averageUsagePerAmenity: number;
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [amenityModalOpen, setAmenityModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [saving, setSaving] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "ALL",
    usageLevel: "ALL",
  });
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
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
        const apiAmenities = (response.data.data.items || response.data.data).map((amenity: any) => ({
          id: amenity.id,
          name: amenity.name,
          icon: amenity.icon || "✨",
          propertiesUsing: amenity.propertyCount || 0,
          status: "active" as const,
          category: amenity.category,
        }));
        setAmenities(apiAmenities);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAmenities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Calculate stats
  const stats: Stats = {
    totalAmenities: amenities.length,
    activeAmenities: amenities.filter((a) => a.status === "active").length,
    totalPropertyUsage: amenities.reduce((sum, a) => sum + a.propertiesUsing, 0),
    averageUsagePerAmenity: Math.round(
      amenities.reduce((sum, a) => sum + a.propertiesUsing, 0) / amenities.length
    ),
  };

  // Filter amenities
  const filteredAmenities = amenities.filter((amenity) => {
    const matchesSearch = amenity.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      appliedFilters.status === "ALL" ||
      (appliedFilters.status === "ACTIVE" && amenity.status === "active") ||
      (appliedFilters.status === "INACTIVE" && amenity.status === "inactive");

    let matchesUsage = true;
    if (appliedFilters.usageLevel !== "ALL") {
      const count = amenity.propertiesUsing;
      if (appliedFilters.usageLevel === "HIGH" && count < 200) matchesUsage = false;
      if (appliedFilters.usageLevel === "MEDIUM" && (count < 50 || count >= 200))
        matchesUsage = false;
      if (appliedFilters.usageLevel === "LOW" && count >= 50) matchesUsage = false;
    }

    return matchesSearch && matchesStatus && matchesUsage;
  });

  const handleApplyFilters = (filters: {
    status: string;
    usageLevel: string;
  }) => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setAppliedFilters({ status: "ALL", usageLevel: "ALL" });
  };

  const removeFilter = (filterType: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [filterType]: "ALL",
    }));
  };

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

  const handleOpenAddModal = () => {
    setEditingAmenity(null);
    setAmenityModalOpen(true);
  };

  const handleOpenEditModal = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setAmenityModalOpen(true);
  };

  const handleSaveAmenity = async (data: { name: string; category: string; icon: string }) => {
    setSaving(true);
    try {
      if (editingAmenity) {
        // Update existing amenity
        const response = await api.put(`/amenities/${editingAmenity.id}`, data);
        if (response.data?.success) {
          setAmenities((prev) =>
            prev.map((a) =>
              a.id === editingAmenity.id
                ? { ...a, name: data.name, category: data.category, icon: data.icon }
                : a
            )
          );
        }
      } else {
        // Create new amenity
        const response = await api.post("/amenities", data);
        if (response.data?.success && response.data?.data) {
          const newAmenity: Amenity = {
            id: response.data.data.id,
            name: data.name,
            icon: data.icon,
            propertiesUsing: 0,
            status: "active",
            category: data.category,
          };
          setAmenities((prev) => [...prev, newAmenity]);
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

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Amenities Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage property amenities across the platform
            </p>
          </div>
          <Button 
            onClick={handleOpenAddModal}
            className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Amenity
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Amenities
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalAmenities}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {stats.activeAmenities}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Property Usage
                </p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.totalPropertyUsage}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Avg Usage Per Amenity
                </p>
                <h3 className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.averageUsagePerAmenity}
                </h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <Card className="p-6 rounded-[5px]">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search amenities by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-[5px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-[5px] ${
                viewMode === "grid" ? "bg-gray-100" : ""
              }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-[5px] ${
                viewMode === "list" ? "bg-gray-100" : ""
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Applied Filters Display */}
          {(appliedFilters.status !== "ALL" ||
            appliedFilters.usageLevel !== "ALL") && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Applied Filters:</span>
              {appliedFilters.status !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.usageLevel !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  {appliedFilters.usageLevel} Usage
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("usageLevel")}
                  />
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card>

        {/* Amenities Section */}
        <Card className="p-6 rounded-[5px]">
          {filteredAmenities.length === 0 && amenities.length > 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No amenities found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <AdminAmenityList
              amenities={filteredAmenities}
              viewMode={viewMode}
              onView={setSelectedAmenity}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          )}
        </Card>

        {/* Amenity Details Modal */}
        {selectedAmenity && (
          <Card className="border-2 border-green-600 p-6 rounded-[5px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAmenity.icon} {selectedAmenity.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Amenity Details & Usage Information
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedAmenity(null)}
                className="rounded-[5px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Amenity Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Amenity Information
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Name</p>
                    <p className="font-semibold mt-1">{selectedAmenity.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Icon</p>
                    <p className="text-3xl mt-1">{selectedAmenity.icon}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                    <p className="font-semibold mt-1">
                      {selectedAmenity.status === "active" ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Usage Information
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Properties Using
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {selectedAmenity.propertiesUsing}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Popularity Level
                    </p>
                    <p className="font-semibold mt-1">
                      {selectedAmenity.propertiesUsing >= 200
                        ? "High"
                        : selectedAmenity.propertiesUsing >= 50
                        ? "Medium"
                        : "Low"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Availability
                    </p>
                    <p className="font-semibold mt-1 text-green-600">
                      Available to users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm rounded-[5px]">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Amenity
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this amenity? This action cannot be
                  undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                    className="rounded-[5px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    className="rounded-[5px]"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AdminAmenityFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Add/Edit Modal */}
      <AdminAmenityModal
        isOpen={amenityModalOpen}
        onClose={() => {
          setAmenityModalOpen(false);
          setEditingAmenity(null);
        }}
        onSave={handleSaveAmenity}
        amenity={editingAmenity}
        saving={saving}
      />
    </AdminDashboardLayout>
  );
}
