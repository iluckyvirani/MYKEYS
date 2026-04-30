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

interface AdminPackageFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string;
    tier: string;
    priceRange: string;
  };
  onApplyFilters: (filters: {
    status: string;
    tier: string;
    priceRange: string;
  }) => void;
  onResetFilters: () => void;
}

const statuses = ["ALL", "ACTIVE", "INACTIVE"];
const tiers = ["ALL", "BASIC", "STANDARD", "PREMIUM"];
const priceRanges = ["ALL", "0-500", "500-1000", "1000+"];

export default function AdminPackageFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: AdminPackageFilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ status: "ALL", tier: "ALL", priceRange: "ALL" });
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

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Package Tier
            </label>
            <Select
              value={localFilters.tier}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, tier: value })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier === "ALL" ? "All Tiers" : tier.charAt(0) + tier.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Price Range (£)
            </label>
            <Select
              value={localFilters.priceRange}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, priceRange: value })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range === "ALL" ? "All Prices" : `£${range}`}
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
