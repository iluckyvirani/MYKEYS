"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface AdminInquiryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters: any;
}

export function AdminInquiryFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters,
}: AdminInquiryFilterModalProps) {
  const [filters, setFilters] = useState({
    status: appliedFilters?.status || "ALL",
    priority: appliedFilters?.priority || "ALL",
    type: appliedFilters?.type || "ALL",
  });

  useEffect(() => {
    setFilters({
      status: appliedFilters?.status || "ALL",
      priority: appliedFilters?.priority || "ALL",
      type: appliedFilters?.type || "ALL",
    });
  }, [appliedFilters]);

  const handleApply = () => {
    const cleanFilters: any = {};
    if (filters.status && filters.status !== "ALL") cleanFilters.status = filters.status;
    if (filters.priority && filters.priority !== "ALL") cleanFilters.priority = filters.priority;
    if (filters.type && filters.type !== "ALL") cleanFilters.type = filters.type;
    
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "ALL",
      priority: "ALL",
      type: "ALL",
    });
    onApply({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Inquiry Status
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
                <SelectItem value="PENDING">New/Pending</SelectItem>
                <SelectItem value="RESPONDED">Replied</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="CONVERTED">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Priority Level
            </label>
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters({ ...filters, priority: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Inquiry Type
            </label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="rental">Rental Inquiry</SelectItem>
                <SelectItem value="purchase">Purchase Inquiry</SelectItem>
                <SelectItem value="viewing">Viewing Request</SelectItem>
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
