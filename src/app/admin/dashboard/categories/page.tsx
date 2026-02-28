"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminCategoryFilterModal from "@/components/dashboard/AdminCategoryFilterModal";
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
import { useState } from "react";

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
  const [categories, setCategories] = useState<ServiceCategory[]>([
    {
      id: "1",
      name: "Plumbing",
      description: "All plumbing services including repairs, installation, and maintenance",
      services: 12,
      status: "active",
      createdDate: "2025-01-10",
    },
    {
      id: "2",
      name: "Electrical",
      description: "Electrical repair and installation services for homes and offices",
      services: 8,
      status: "active",
      createdDate: "2025-01-12",
    },
    {
      id: "3",
      name: "Cleaning",
      description: "Professional home and office cleaning services",
      services: 15,
      status: "active",
      createdDate: "2025-01-15",
    },
    {
      id: "4",
      name: "Carpentry",
      description: "Woodwork and carpentry services for custom furniture and repairs",
      services: 6,
      status: "active",
      createdDate: "2025-01-18",
    },
    {
      id: "5",
      name: "Painting",
      description: "Interior and exterior painting services",
      services: 9,
      status: "inactive",
      createdDate: "2025-01-20",
    },
    {
      id: "6",
      name: "Gardening",
      description: "Landscaping and gardening services for outdoor spaces",
      services: 7,
      status: "active",
      createdDate: "2025-01-22",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "ALL",
  });
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Calculate stats
  const stats: Stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.status === "active").length,
    totalServices: categories.reduce((sum, c) => sum + c.services, 0),
    averageServicesPerCategory: Math.round(
      categories.reduce((sum, c) => sum + c.services, 0) / categories.length
    ),
  };

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      appliedFilters.status === "ALL" ||
      (appliedFilters.status === "ACTIVE" && category.status === "active") ||
      (appliedFilters.status === "INACTIVE" && category.status === "inactive");

    return matchesSearch && matchesStatus;
  });

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

  const handleDelete = (id: string) => {
    setDeleting(true);
    setTimeout(() => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      setDeleting(false);
    }, 500);
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
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]">
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
                className="text-gray-600 hover:text-gray-900"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card>

        {/* Categories Section */}
        <Card className="p-6 rounded-[5px]">
          {filteredCategories.length === 0 && categories.length > 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No categories found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <AdminCategoryList
              categories={filteredCategories}
              viewMode={viewMode}
              onView={setSelectedCategory}
              onEdit={() => {}}
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
    </AdminDashboardLayout>
  );
}
