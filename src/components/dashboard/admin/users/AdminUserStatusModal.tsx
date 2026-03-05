"use client";

import { useState, useEffect } from "react";
import { X, User, Shield, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  status: "active" | "inactive" | "suspended";
  createdAt: string;
}

interface AdminUserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, status: string) => void;
  user: UserType | null;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "INACTIVE", label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-300" },
  { value: "SUSPENDED", label: "Suspended", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
];

export function AdminUserStatusModal({
  isOpen,
  onClose,
  onSave,
  user,
  loading = false,
}: AdminUserStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");

  useEffect(() => {
    if (user) {
      setSelectedStatus(user.status.toUpperCase());
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = () => {
    onSave(user.id, selectedStatus);
  };

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Owner";
      case "SERVICE":
        return "Service";
      default:
        return "User";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 rounded-[5px]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Update User Status</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  {user.roles && user.roles.length > 0 ? (
                    <>
                      {getRoleIcon(user.roles[0])}
                      <span>{getRoleLabel(user.roles[0])}</span>
                    </>
                  ) : (
                    <span>No role assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedStatus === option.value
                      ? `${option.color} border-current`
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Warning for suspend */}
          {selectedStatus === "SUSPENDED" && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> Suspending this user will prevent them from accessing the platform.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-[5px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px]"
            >
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
