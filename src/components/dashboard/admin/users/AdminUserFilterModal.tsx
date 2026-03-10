"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    role: appliedFilters?.role || "ALL",
    status: appliedFilters?.status || "ALL",
    accountType: appliedFilters?.accountType || "ALL",
    verificationStatus: appliedFilters?.verificationStatus || "ALL",
  });

  useEffect(() => {
    setFilters({
      role: appliedFilters?.role || "ALL",
      status: appliedFilters?.status || "ALL",
      accountType: appliedFilters?.accountType || "ALL",
      verificationStatus: appliedFilters?.verificationStatus || "ALL",
    });
  }, [appliedFilters]);

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.role && filters.role !== "ALL") cleanFilters.role = filters.role;
    if (filters.status && filters.status !== "ALL") cleanFilters.status = filters.status;
    if (filters.accountType && filters.accountType !== "ALL") cleanFilters.accountType = filters.accountType;
    if (filters.verificationStatus && filters.verificationStatus !== "ALL") cleanFilters.verificationStatus = filters.verificationStatus;
    
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      role: "ALL",
      status: "ALL",
      accountType: "ALL",
      verificationStatus: "ALL",
    });
    onApply({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              User Role
            </label>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="USER">Tenant</SelectItem>
                <SelectItem value="OWNER">Property Owner</SelectItem>
                <SelectItem value="SERVICE">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Account Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Verification Status
            </label>
            <Select
              value={filters.verificationStatus}
              onValueChange={(value) => setFilters({ ...filters, verificationStatus: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
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
