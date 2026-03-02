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

interface AdminAmenityFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string;
    usageLevel: string;
  };
  onApplyFilters: (filters: { status: string; usageLevel: string }) => void;
  onResetFilters: () => void;
}

const statuses = ["ALL", "ACTIVE", "INACTIVE"];
const usageLevels = ["ALL", "HIGH", "MEDIUM", "LOW"];

export default function AdminAmenityFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: AdminAmenityFilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ status: "ALL", usageLevel: "ALL" });
    onResetFilters();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Amenities</DialogTitle>
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

          {/* Usage Level Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Usage Level
            </label>
            <div className="space-y-2">
              {usageLevels.map((level) => (
                <label key={level} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="usageLevel"
                    value={level}
                    checked={localFilters.usageLevel === level}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        usageLevel: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {level === "ALL"
                      ? "All Levels"
                      : `${level} (${
                          level === "HIGH"
                            ? "200+ properties"
                            : level === "MEDIUM"
                            ? "50-200 properties"
                            : "Less than 50 properties"
                        })`}
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
