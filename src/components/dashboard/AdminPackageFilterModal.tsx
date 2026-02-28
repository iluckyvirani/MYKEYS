"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
          <DialogTitle>Filter Packages</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Status
            </label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <label key={status} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={localFilters.status === status}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        status: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {status === "ALL" ? "All Status" : status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Package Tier
            </label>
            <div className="space-y-2">
              {tiers.map((tier) => (
                <label key={tier} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="tier"
                    value={tier}
                    checked={localFilters.tier === tier}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        tier: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {tier === "ALL" ? "All Tiers" : tier}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Price Range (₹)
            </label>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label key={range} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    value={range}
                    checked={localFilters.priceRange === range}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        priceRange: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {range === "ALL" ? "All Prices" : `₹${range}`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
