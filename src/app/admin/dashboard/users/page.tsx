"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminUserFilterModal } from "@/components/dashboard/admin/users/AdminUserFilterModal";
import { AdminUserList } from "@/components/dashboard/admin/users/AdminUserList";
import { AdminUserStatusModal } from "@/components/dashboard/admin/users/AdminUserStatusModal";
import { AdminUserDeleteModal } from "@/components/dashboard/admin/users/AdminUserDeleteModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter, Download, X, Users, Shield, Package, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  bookings?: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0 });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("pageSize", pagination.pageSize.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (appliedFilters.role) params.append("role", appliedFilters.role);
      if (appliedFilters.status) params.append("status", appliedFilters.status.toUpperCase());
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      if (response.data?.success && response.data?.data?.items) {
        const apiUsers = response.data.data.items.map((user: any) => {
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || "",
            roles: Array.isArray(user.roles) ? user.roles : (user.roles?.map?.((r: any) => r.role) || []),
            status: (user.status || "ACTIVE").toLowerCase() as "active" | "inactive" | "suspended",
            createdAt: user.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
            bookings: user.totalBookings || 0,
          };
        });
        setUsers(apiUsers);
        setPagination(prev => ({ ...prev, total: response.data.data.pagination?.total || apiUsers.length }));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchTerm, appliedFilters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Use debounced search - trigger API when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Users are already filtered by API, just use them directly
  const filteredUsers = users;

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

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setStatusModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    router.push(`/admin/dashboard/users/${user.id}`);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (userId: string) => {
    setDeletingUser(true);
    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers();
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    } finally {
      setDeletingUser(false);
    }
  };

  const handleStatusUpdate = async (userId: string, status: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch("/admin/users", { userId, status });
      await fetchUsers();
      setStatusModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const activeUsers = users.filter(u => u.status === "active").length;
  const suspendedUsers = users.filter(u => u.status === "suspended").length;
  const ownerCount = users.filter(u => u.roles?.includes("OWNER")).length;
  const serviceCount = users.filter(u => u.roles?.includes("SERVICE")).length;

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage all users, owners, and service providers on the platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {/* <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeUsers} active</span>
              <span className="text-gray-500 ml-2">• {suspendedUsers} suspended</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{ownerCount}</div>
                <div className="text-sm text-gray-600">Property Owners</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {ownerCount > 0 && `${Math.round(ownerCount / users.length * 100)}% of users`}
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{users.length - ownerCount - serviceCount}</div>
                <div className="text-sm text-gray-600">Tenants</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Regular users
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{serviceCount}</div>
                <div className="text-sm text-gray-600">Service Providers</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {serviceCount > 0 && `${Math.round(serviceCount / users.length * 100)}% of users`}
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
                  placeholder="Search users by name or email..."
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
              Filters
            </Button>
          </div>

          {/* Applied Filters Display */}
          {showAppliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {appliedFilters.role && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Role: {appliedFilters.role}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("role")}
                  />
                </Badge>
              )}
              {appliedFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Status: {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.verificationStatus && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Verification: {appliedFilters.verificationStatus}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("verificationStatus")}
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

        {/* User List */}
        <AdminUserList
          users={filteredUsers}
          loading={loading}
          empty={filteredUsers.length === 0}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteClick}
        />

        {/* Filter Modal */}
        <AdminUserFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />

        {/* User Status Modal */}
        <AdminUserStatusModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleStatusUpdate}
          user={selectedUser}
          loading={updatingStatus}
        />

        {/* User Delete Modal */}
        <AdminUserDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteConfirm}
          user={selectedUser}
        />
      </div>
    </AdminDashboardLayout>
  );
}

