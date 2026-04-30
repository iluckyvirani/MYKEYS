"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AdminBookingFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminBookingFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminBookingFilterModalProps) {
  const [filters, setFilters] = useState({
    status: appliedFilters?.status || "ALL",
    duration: appliedFilters?.duration || "ALL",
    priceRange: appliedFilters?.priceRange || "ALL",
  });

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.status && filters.status !== "ALL") cleanFilters.status = filters.status;
    if (filters.duration && filters.duration !== "ALL") cleanFilters.duration = filters.duration;
    if (filters.priceRange && filters.priceRange !== "ALL") cleanFilters.priceRange = filters.priceRange;
    
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "ALL",
      duration: "ALL",
      priceRange: "ALL",
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
              Booking Status
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Stay Duration
            </label>
            <Select
              value={filters.duration}
              onValueChange={(value) => setFilters({ ...filters, duration: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Durations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Durations</SelectItem>
                <SelectItem value="1-3 nights">1-3 nights</SelectItem>
                <SelectItem value="4-7 nights">4-7 nights</SelectItem>
                <SelectItem value="8-15 nights">8-15 nights</SelectItem>
                <SelectItem value="15+ nights">15+ nights</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Booking Value
            </label>
            <Select
              value={filters.priceRange}
              onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Values" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Values</SelectItem>
                <SelectItem value="£0-50K">£0-50K</SelectItem>
                <SelectItem value="£50K-100K">£50K-100K</SelectItem>
                <SelectItem value="£100K-200K">£100K-200K</SelectItem>
                <SelectItem value="£200K+">£200K+</SelectItem>
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