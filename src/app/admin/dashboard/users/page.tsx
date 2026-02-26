"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Plus, Eye, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "USER" | "OWNER" | "SERVICE";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  bookings?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "USER" | "OWNER" | "SERVICE">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "suspended">("all");

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockUsers: User[] = [
      {
        id: "1",
        firstName: "Rajesh",
        lastName: "Kumar",
        email: "rajesh@example.com",
        phone: "+91-9876543210",
        role: "OWNER",
        status: "active",
        createdAt: "2025-01-15",
        bookings: 12,
      },
      {
        id: "2",
        firstName: "Priya",
        lastName: "Singh",
        email: "priya@example.com",
        phone: "+91-9876543211",
        role: "USER",
        status: "active",
        createdAt: "2025-01-20",
        bookings: 3,
      },
      {
        id: "3",
        firstName: "Amit",
        lastName: "Patel",
        email: "amit@example.com",
        phone: "+91-9876543212",
        role: "SERVICE",
        status: "active",
        createdAt: "2025-01-10",
        bookings: 45,
      },
      {
        id: "4",
        firstName: "Neha",
        lastName: "Sharma",
        email: "neha@example.com",
        phone: "+91-9876543213",
        role: "USER",
        status: "inactive",
        createdAt: "2024-12-05",
        bookings: 0,
      },
      {
        id: "5",
        firstName: "Vikram",
        lastName: "Reddy",
        email: "vikram@example.com",
        phone: "+91-9876543214",
        role: "OWNER",
        status: "suspended",
        createdAt: "2025-01-01",
        bookings: 8,
      },
    ];
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-blue-100 text-blue-800";
      case "SERVICE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case "suspended":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users, owners, and service providers on the platform</p>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Roles</option>
                <option value="USER">Users</option>
                <option value="OWNER">Owners</option>
                <option value="SERVICE">Service Providers</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className="text-sm text-gray-600 capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{user.createdAt}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
