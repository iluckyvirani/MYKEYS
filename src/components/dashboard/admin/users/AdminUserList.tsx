"use client";

import { Users, Mail, Phone, CheckCircle, XCircle, Eye, Edit, Trash2, Shield, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

interface AdminUserListProps {
  users: User[];
  loading: boolean;
  empty: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
}

export function AdminUserList({
  users,
  loading,
  empty,
  onEdit,
  onDelete,
  onView,
}: AdminUserListProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Shield className="w-4 h-4" />;
      case "SERVICE":
        return <Package className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-blue-100 text-blue-700";
      case "SERVICE":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Property Owner";
      case "SERVICE":
        return "Service Provider";
      default:
        return "Tenant";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border overflow-hidden">
        <div className="space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="text-center py-16 bg-white rounded-[5px] border">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-sm text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Name</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Email</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Phone</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Role</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Joined</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getRoleColor(user.role)} flex items-center justify-center flex-shrink-0`}>
                      {getRoleIcon(user.role) && (
                        <span className="text-white">{getRoleIcon(user.role)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">{user.email}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user.status)}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-blue-50"
                      onClick={() => onView?.(user)}
                      title="View user details"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-green-50"
                      onClick={() => onEdit?.(user)}
                      title="Edit user"
                    >
                      <Edit className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => onDelete?.(user)}
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
