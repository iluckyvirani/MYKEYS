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
          <DialogTitle>Filter Properties</DialogTitle>
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
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {status === "ALL" ? "All Status" : status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Property Type
            </label>
            <div className="space-y-2">
              {types.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={localFilters.type === type}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        type: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {type === "ALL" ? "All Types" : type}
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
