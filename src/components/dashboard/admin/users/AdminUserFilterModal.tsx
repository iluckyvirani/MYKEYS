"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface AdminUserFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters: any;
}

export function AdminUserFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters,
}: AdminUserFilterModalProps) {
  const [filters, setFilters] = useState({
    role: appliedFilters?.role || "",
    status: appliedFilters?.status || "",
    accountType: appliedFilters?.accountType || "",
    verificationStatus: appliedFilters?.verificationStatus || "",
  });

  useEffect(() => {
    setFilters({
      role: appliedFilters?.role || "",
      status: appliedFilters?.status || "",
      accountType: appliedFilters?.accountType || "",
      verificationStatus: appliedFilters?.verificationStatus || "",
    });
  }, [appliedFilters]);

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.role) cleanFilters.role = filters.role;
    if (filters.status) cleanFilters.status = filters.status;
    if (filters.accountType) cleanFilters.accountType = filters.accountType;
    if (filters.verificationStatus) cleanFilters.verificationStatus = filters.verificationStatus;
    
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      role: "",
      status: "",
      accountType: "",
      verificationStatus: "",
    });
    onApply({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              User Role
            </label>
            <div className="space-y-2">
              {[
                { value: "", label: "All Roles" },
                { value: "USER", label: "Tenant" },
                { value: "OWNER", label: "Property Owner" },
                { value: "SERVICE", label: "Service Provider" },
              ].map((role) => (
                <label key={role.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={filters.role === role.value}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Account Status
            </label>
            <div className="space-y-2">
              {[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ].map((status) => (
                <label key={status.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={filters.status === status.value}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Verification Status
            </label>
            <div className="space-y-2">
              {[
                { value: "", label: "All" },
                { value: "verified", label: "Verified" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
              ].map((status) => (
                <label key={status.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="verification"
                    value={status.value}
                    checked={filters.verificationStatus === status.value}
                    onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 rounded-[5px]"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px]"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
