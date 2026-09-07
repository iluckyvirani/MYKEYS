"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AdminServiceProviderFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminServiceProviderFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminServiceProviderFilterModalProps) {
  const [filters, setFilters] = useState({
    status: appliedFilters?.status || "ALL",
    serviceType: appliedFilters?.serviceType || "ALL",
    ratingRange: appliedFilters?.ratingRange || "ALL",
  });

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.status && filters.status !== "ALL") cleanFilters.status = filters.status;
    if (filters.serviceType && filters.serviceType !== "ALL") cleanFilters.serviceType = filters.serviceType;
    if (filters.ratingRange && filters.ratingRange !== "ALL") cleanFilters.ratingRange = filters.ratingRange;
    
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "ALL",
      serviceType: "ALL",
      ratingRange: "ALL",
    });
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
              Status
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
              </SelectContent>
            </Select>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Service Type
            </label>
            <Select
              value={filters.serviceType}
              onValueChange={(value) => setFilters({ ...filters, serviceType: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
                <SelectItem value="Carpentry">Carpentry</SelectItem>
                <SelectItem value="Painting">Painting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Minimum Rating
            </label>
            <Select
              value={filters.ratingRange}
              onValueChange={(value) => setFilters({ ...filters, ratingRange: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Ratings</SelectItem>
                <SelectItem value="4.5+">4.5+</SelectItem>
                <SelectItem value="4.0+">4.0+</SelectItem>
                <SelectItem value="3.5+">3.5+</SelectItem>
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
