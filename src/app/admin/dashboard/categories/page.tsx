"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminCategoryFilterModal from "@/components/dashboard/AdminCategoryFilterModal";
import AdminCategoryModal from "@/components/dashboard/AdminCategoryModal";
import AdminCategoryList from "@/components/dashboard/AdminCategoryList";
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
  Layers,
  Briefcase,
  TrendingUp,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: number;
  status: "active" | "inactive";
  createdDate: string;
}

interface Stats {
  totalCategories: number;
  activeCategories: number;
  totalServices: number;
  averageServicesPerCategory: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "ALL",
  });
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("pageSize", "100");
      if (searchTerm) params.append("search", searchTerm);
      if (appliedFilters.status !== "ALL") params.append("status", appliedFilters.status);

      const response = await api.get(`/admin/categories?${params.toString()}`);
      if (response.data?.success && response.data?.data) {
        const apiCategories = (response.data.data.items || response.data.data).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || "",
          services: cat.serviceCount || 0,
          status: cat.status as "active" | "inactive",
          createdDate: cat.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }));
        setCategories(apiCategories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, appliedFilters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Calculate stats
  const stats: Stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.status === "active").length,
    totalServices: categories.reduce((sum, c) => sum + c.services, 0),
    averageServicesPerCategory: categories.length > 0
      ? Math.round(categories.reduce((sum, c) => sum + c.services, 0) / categories.length)
      : 0,
  };

  // Filter categories (already filtered by API, but keep for local filtering)
  const filteredCategories = categories;

  const handleApplyFilters = (filters: { status: string }) => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setAppliedFilters({ status: "ALL" });
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
      await api.delete(`/admin/categories/${id}`);
      await fetchCategories();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditModal = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: { name: string; description: string; status: "active" | "inactive" }) => {
    setSaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        await api.patch(`/admin/categories/${editingCategory.id}`, data);
      } else {
        // Create new category
        await api.post("/admin/categories", data);
      }
      await fetchCategories();
      setCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category");
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
            <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
            <p className="text-gray-600 mt-1">
              Manage and organize all service categories
            </p>
          </div>
          <Button 
            onClick={handleOpenAddModal}
            className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Categories
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalCategories}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {stats.activeCategories}
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
                  Total Services
                </p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.totalServices}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Per Category</p>
                <h3 className="text-3xl font-bold text-orange-600 mt-2">
                  {stats.averageServicesPerCategory}
                </h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Layers className="w-6 h-6 text-orange-600" />
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
                placeholder="Search categories by name or description..."
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
          {appliedFilters.status !== "ALL" && (
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

        {/* Categories Section */}
        <Card className="p-6 rounded-[5px]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-3">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 && categories.length > 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No categories found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No categories yet
              </h3>
              <p className="text-gray-600">
                Create your first service category
              </p>
            </div>
          ) : (
            <AdminCategoryList
              categories={filteredCategories}
              viewMode={viewMode}
              onView={setSelectedCategory}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          )}
        </Card>

        {/* Category Details Modal */}
        {selectedCategory && (
          <Card className="border-2 border-green-600 p-6 rounded-[5px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Category Details & Information
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className="rounded-[5px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Category Information
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Name</p>
                    <p className="font-semibold mt-1">{selectedCategory.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Description
                    </p>
                    <p className="font-semibold mt-1">
                      {selectedCategory.description}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                    <p className="font-semibold mt-1">
                      {selectedCategory.status === "active" ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Services Information
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Total Services
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {selectedCategory.services}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Created Date
                    </p>
                    <p className="font-semibold mt-1">
                      {new Date(selectedCategory.createdDate).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
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
                  Delete Category
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this category? This action cannot be
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
      <AdminCategoryFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Add/Edit Modal */}
      <AdminCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
        saving={saving}
      />
    </AdminDashboardLayout>
  );
}
