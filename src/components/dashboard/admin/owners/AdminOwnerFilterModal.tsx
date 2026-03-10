"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface AdminOwnerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters: any;
}

export function AdminOwnerFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters,
}: AdminOwnerFilterModalProps) {
  const [filters, setFilters] = useState({
    status: appliedFilters?.status || "ALL",
    propertyRange: appliedFilters?.propertyRange || "ALL",
    revenueRange: appliedFilters?.revenueRange || "ALL",
  });

  useEffect(() => {
    setFilters({
      status: appliedFilters?.status || "ALL",
      propertyRange: appliedFilters?.propertyRange || "ALL",
      revenueRange: appliedFilters?.revenueRange || "ALL",
    });
  }, [appliedFilters]);

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.status && filters.status !== "ALL") cleanFilters.status = filters.status;
    if (filters.propertyRange && filters.propertyRange !== "ALL") cleanFilters.propertyRange = filters.propertyRange;
    if (filters.revenueRange && filters.revenueRange !== "ALL") cleanFilters.revenueRange = filters.revenueRange;

    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "ALL",
      propertyRange: "ALL",
      revenueRange: "ALL",
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

          {/* Property Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Number of Properties
            </label>
            <Select
              value={filters.propertyRange}
              onValueChange={(value) => setFilters({ ...filters, propertyRange: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Ranges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Ranges</SelectItem>
                <SelectItem value="1-2">1-2 properties</SelectItem>
                <SelectItem value="3-5">3-5 properties</SelectItem>
                <SelectItem value="6+">6+ properties</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Revenue Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Revenue Range
            </label>
            <Select
              value={filters.revenueRange}
              onValueChange={(value) => setFilters({ ...filters, revenueRange: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Ranges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Ranges</SelectItem>
                <SelectItem value="0-50k">₹0 - ₹50K</SelectItem>
                <SelectItem value="50k-100k">₹50K - ₹100K</SelectItem>
                <SelectItem value="100k+">₹100K+</SelectItem>
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

interface AdminOwnerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters: any;
}