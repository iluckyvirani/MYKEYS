"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminOwnerFilterModal } from "@/components/dashboard/admin/owners/AdminOwnerFilterModal";
import { AdminOwnerList } from "@/components/dashboard/admin/owners/AdminOwnerList";
import { AdminOwnerDeleteModal } from "@/components/dashboard/admin/owners/AdminOwnerDeleteModal";
import { AdminOwnerStatusModal } from "@/components/dashboard/admin/owners/AdminOwnerStatusModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter, Download, X, Building, TrendingUp, Users, Home } from "lucide-react";
import { api } from "@/lib/api";

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  properties: number;
  revenue: number;
  status: "active" | "inactive" | "suspended";
  joinedDate: string;
}

export default function OwnersPage() {
  const router = useRouter();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deletingOwner, setDeletingOwner] = useState(false);
  const [updatingOwner, setUpdatingOwner] = useState(false);

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("pageSize", "50");
      if (searchTerm) params.append("search", searchTerm);
      if (appliedFilters.status) params.append("status", appliedFilters.status.toUpperCase());
      
      const response = await api.get(`/admin/owners?${params.toString()}`);
      if (response.data?.success && response.data?.data?.items) {
        const apiOwners = response.data.data.items.map((owner: any) => ({
          id: owner.id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          phone: owner.phone || "",
          properties: owner.totalProperties || 0,
          revenue: 0, // Revenue not available in owner API
          status: (owner.status || "ACTIVE").toLowerCase() as "active" | "inactive" | "suspended",
          joinedDate: owner.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }));
        setOwners(apiOwners);
      }
    } catch (err) {
      console.error("Error fetching owners:", err);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, appliedFilters]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOwners();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Owners are already filtered by API
  const filteredOwners = owners;

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowAppliedFilters(Object.keys(filters).length > 0);
  };

  const handleClearFilter = (filterKey: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    setAppliedFilters(newFilters);
    setShowAppliedFilters(Object.keys(newFilters).length > 0);
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setShowAppliedFilters(false);
  };

  const handleViewOwner = (owner: Owner) => {
    router.push(`/admin/dashboard/owners/${owner.id}`);
  };

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setStatusModalOpen(true);
  };

  const handleDeleteClick = (owner: Owner) => {
    setSelectedOwner(owner);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (ownerId: string) => {
    setDeletingOwner(true);
    try {
      await api.delete(`/admin/owners/${ownerId}`);
      await fetchOwners();
      setDeleteModalOpen(false);
      setSelectedOwner(null);
    } catch (error) {
      console.error("Error deleting owner:", error);
      throw error;
    } finally {
      setDeletingOwner(false);
    }
  };

  const handleStatusUpdate = async (ownerId: string, data: any) => {
    setUpdatingOwner(true);
    try {
      await api.patch(`/admin/owners/${ownerId}`, data);
      await fetchOwners();
      setStatusModalOpen(false);
      setSelectedOwner(null);
    } catch (error) {
      console.error("Error updating owner:", error);
      throw error;
    } finally {
      setUpdatingOwner(false);
    }
  };

  const activeOwners = owners.filter(o => o.status === "active").length;
  const suspendedOwners = owners.filter(o => o.status === "suspended").length;
  const totalProperties = owners.reduce((sum, o) => sum + o.properties, 0);
  const totalRevenue = owners.reduce((sum, o) => sum + o.revenue, 0);

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Management</h1>
            <p className="text-gray-600 mt-2">
              Manage property owners and their listings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {/* Owners register themselves through the signup flow */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{owners.length}</div>
                <div className="text-sm text-gray-600">Total Owners</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeOwners} active</span>
              <span className="text-gray-500 ml-2">• {suspendedOwners} suspended</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalProperties}</div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Across all owners
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">£{(totalRevenue / 100000).toFixed(1)}L</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Cumulative revenue
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  £{owners.length > 0 ? (totalRevenue / owners.length / 1000).toFixed(0) : "0"}K
                </div>
                <div className="text-sm text-gray-600">Avg Revenue</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Per owner
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-[5px] border p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search owners by name or email..."
                  className="pl-10 w-full rounded-[5px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* Applied Filters Display */}
          {showAppliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {appliedFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Status: {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.propertyRange && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Properties: {appliedFilters.propertyRange}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("propertyRange")}
                  />
                </Badge>
              )}
              {appliedFilters.revenueRange && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Revenue: {appliedFilters.revenueRange}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("revenueRange")}
                  />
                </Badge>
              )}
              {Object.keys(appliedFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Owner List */}
        <AdminOwnerList
          owners={filteredOwners}
          loading={loading}
          empty={filteredOwners.length === 0}
          onView={handleViewOwner}
          onEdit={handleEditOwner}
          onDelete={handleDeleteClick}
        />

        {/* Filter Modal */}
        <AdminOwnerFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />

        {/* Status/Edit Modal */}
        <AdminOwnerStatusModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          onSave={handleStatusUpdate}
          owner={selectedOwner}
          loading={updatingOwner}
        />

        {/* Delete Modal */}
        <AdminOwnerDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          owner={selectedOwner}
        />
      </div>
    </AdminDashboardLayout>
  );
}
