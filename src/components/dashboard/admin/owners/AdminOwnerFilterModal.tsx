"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    status: appliedFilters?.status || "",
    propertyRange: appliedFilters?.propertyRange || "",
    revenueRange: appliedFilters?.revenueRange || "",
  });

  useEffect(() => {
    setFilters({
      status: appliedFilters?.status || "",
      propertyRange: appliedFilters?.propertyRange || "",
      revenueRange: appliedFilters?.revenueRange || "",
    });
  }, [appliedFilters]);

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.status) cleanFilters.status = filters.status;
    if (filters.propertyRange) cleanFilters.propertyRange = filters.propertyRange;
    if (filters.revenueRange) cleanFilters.revenueRange = filters.revenueRange;
    
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "",
      propertyRange: "",
      revenueRange: "",
    });
    onApply({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Owners</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          {/* Property Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Number of Properties
            </label>
            <div className="space-y-2">
              {[
                { value: "", label: "All Ranges" },
                { value: "1-2", label: "1-2 properties" },
                { value: "3-5", label: "3-5 properties" },
                { value: "6+", label: "6+ properties" },
              ].map((range) => (
                <label key={range.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="propertyRange"
                    value={range.value}
                    checked={filters.propertyRange === range.value}
                    onChange={(e) => setFilters({ ...filters, propertyRange: e.target.value })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Revenue Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Revenue Range
            </label>
            <div className="space-y-2">
              {[
                { value: "", label: "All Ranges" },
                { value: "0-50k", label: "₹0 - ₹50K" },
                { value: "50k-100k", label: "₹50K - ₹100K" },
                { value: "100k+", label: "₹100K+" },
              ].map((range) => (
                <label key={range.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="revenueRange"
                    value={range.value}
                    checked={filters.revenueRange === range.value}
                    onChange={(e) => setFilters({ ...filters, revenueRange: e.target.value })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
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
