"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface AdminPropertyFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string;
    type: string;
  };
  onApplyFilters: (filters: { status: string; type: string }) => void;
  onResetFilters: () => void;
}

const statuses = ["ALL", "ACTIVE", "INACTIVE", "PENDING"];
const types = [
  "ALL",
  "Apartment",
  "Villa",
  "Studio",
  "House",
  "Bungalow",
  "Penthouse",
  "Cottage",
];

export default function AdminPropertyFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: AdminPropertyFilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ status: "ALL", type: "ALL" });
    onResetFilters();
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
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, status: value })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "ALL" ? "All Status" : status.charAt(0) + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Property Type
            </label>
            <Select
              value={localFilters.type}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, type: value })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "ALL" ? "All Types" : type}
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
