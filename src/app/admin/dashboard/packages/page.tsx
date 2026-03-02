"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminPackageFilterModal from "@/components/dashboard/AdminPackageFilterModal";
import AdminPackageModal from "@/components/dashboard/AdminPackageModal";
import AdminPackageList from "@/components/dashboard/AdminPackageList";
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
  Package,
  Users,
  TrendingUp,
  DollarSign,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

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

interface Stats {
  totalPackages: number;
  activePackages: number;
  totalSubscribers: number;
  totalRevenue: number;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [saving, setSaving] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "ALL",
    tier: "ALL",
    priceRange: "ALL",
  });
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/packages");
      if (response.data?.success && response.data?.data) {
        const apiPackages = response.data.data.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          tier: pkg.tier || "BASIC",
          price: pkg.price || 0,
          duration: pkg.duration || "monthly",
          propertyLimit: pkg.propertyLimit || 3,
          featuredLimit: pkg.featuredLimit || 1,
          storageLimit: pkg.storageLimit || 10,
          dailyLeadsLimit: pkg.dailyLeadsLimit || 5,
          isActive: pkg.isActive ?? true,
          subscribers: pkg._count?.subscribers || 0,
          supportLevel: pkg.supportLevel || "standard",
        }));
        setPackages(apiPackages);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    setPackageModalOpen(true);
  };

  const handleOpenEditModal = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setPackageModalOpen(true);
  };

  const handleSavePackage = async (packageData: any) => {
    setSaving(true);
    try {
      if (editingPackage) {
        await api.patch(`/packages/${editingPackage.id}`, packageData);
      } else {
        await api.post("/packages", packageData);
      }
      await fetchPackages();
      setPackageModalOpen(false);
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/packages/${id}`);
      await fetchPackages();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package");
    } finally {
      setDeleting(false);
    }
  };

  // Calculate stats
  const stats: Stats = {
    totalPackages: packages.length,
    activePackages: packages.filter((p) => p.isActive).length,
    totalSubscribers: packages.reduce((sum, p) => sum + p.subscribers, 0),
    totalRevenue: packages.reduce((sum, p) => sum + p.price * p.subscribers, 0),
  };

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      appliedFilters.status === "ALL" ||
      (appliedFilters.status === "ACTIVE" && pkg.isActive) ||
      (appliedFilters.status === "INACTIVE" && !pkg.isActive);

    const matchesTier =
      appliedFilters.tier === "ALL" || pkg.tier === appliedFilters.tier;

    let matchesPrice = true;
    if (appliedFilters.priceRange !== "ALL") {
      const [min, max] = appliedFilters.priceRange
        .split("-")
        .map((v) => (v === "+" ? Infinity : parseFloat(v)));
      matchesPrice = pkg.price >= min && pkg.price <= max;
    }

    return matchesSearch && matchesStatus && matchesTier && matchesPrice;
  });

  const handleApplyFilters = (filters: {
    status: string;
    tier: string;
    priceRange: string;
  }) => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setAppliedFilters({ status: "ALL", tier: "ALL", priceRange: "ALL" });
  };

  const removeFilter = (filterType: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [filterType]: "ALL",
    }));
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Package Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage subscription packages for property owners
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
            onClick={handleOpenAddModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Packages
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalPackages}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Active Packages
                </p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {stats.activePackages}
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
                  Total Subscribers
                </p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.totalSubscribers}
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
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold text-orange-600 mt-2">
                  {formatCurrency(stats.totalRevenue)}
                </h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
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
                placeholder="Search packages by name..."
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
            appliedFilters.tier !== "ALL" ||
            appliedFilters.priceRange !== "ALL") && (
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
              {appliedFilters.tier !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  {appliedFilters.tier}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("tier")}
                  />
                </Badge>
              )}
              {appliedFilters.priceRange !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  ₹{appliedFilters.priceRange}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("priceRange")}
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

        {/* Packages Section */}
        <Card className="p-6 rounded-[5px]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-3">Loading packages...</p>
            </div>
          ) : filteredPackages.length === 0 && packages.length > 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No packages found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No packages yet
              </h3>
              <p className="text-gray-600">
                Create your first package to get started
              </p>
            </div>
          ) : (
            <AdminPackageList
              packages={filteredPackages}
              viewMode={viewMode}
              onView={setSelectedPackage}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          )}
        </Card>

        {/* Package Details Modal */}
        {selectedPackage && (
          <Card className="border-2 border-green-600 p-6 rounded-[5px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPackage.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Package Details & Information
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedPackage(null)}
                className="rounded-[5px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Package Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Package Information
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Tier</p>
                    <p className="font-semibold mt-1">{selectedPackage.tier}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Price</p>
                    <p className="font-semibold mt-1">
                      ₹{selectedPackage.price}/{selectedPackage.duration}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                    <p className="font-semibold mt-1">
                      {selectedPackage.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Subscribers
                    </p>
                    <p className="font-semibold mt-1">
                      {selectedPackage.subscribers}
                    </p>
                  </div>
                </div>
              </div>

              {/* Limits & Features */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Limits & Features
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Properties
                    </p>
                    <p className="font-semibold mt-1">
                      {selectedPackage.propertyLimit}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Featured
                    </p>
                    <p className="font-semibold mt-1">
                      {selectedPackage.featuredLimit}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Storage
                    </p>
                    <p className="font-semibold mt-1">
                      {selectedPackage.storageLimit}GB
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Daily Leads
                    </p>
                    <p className="font-semibold mt-1">
                      {selectedPackage.dailyLeadsLimit}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-[5px]">
                    <p className="text-sm text-gray-600 font-semibold">
                      Support Level
                    </p>
                    <p className="font-semibold mt-1 capitalize">
                      {selectedPackage.supportLevel}
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
                  Delete Package
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this package? This action cannot be
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
      <AdminPackageFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Package Add/Edit Modal */}
      <AdminPackageModal
        isOpen={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        onSave={handleSavePackage}
        package={editingPackage}
        saving={saving}
      />
    </AdminDashboardLayout>
  );
}
