"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface AdminPaymentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminPaymentFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminPaymentFilterModalProps) {
  const [filters, setFilters] = useState({
    status: appliedFilters?.status || "ALL",
    method: appliedFilters?.method || "ALL",
    type: appliedFilters?.type || "ALL",
  });

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.status && filters.status !== "ALL") cleanFilters.status = filters.status;
    if (filters.method && filters.method !== "ALL") cleanFilters.method = filters.method;
    if (filters.type && filters.type !== "ALL") cleanFilters.type = filters.type;
    
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "ALL",
      method: "ALL",
      type: "ALL",
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
              Payment Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {["completed", "pending", "failed"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Payment Method
            </label>
            <Select
              value={filters.method}
              onValueChange={(value) =>
                setFilters({ ...filters, method: value })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                {["Razorpay", "Credit Card", "Google Pay", "UPI", "Net Banking"].map(
                  (method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Transaction Type
            </label>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters({ ...filters, type: value })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {["Booking", "Service", "Subscription"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
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
