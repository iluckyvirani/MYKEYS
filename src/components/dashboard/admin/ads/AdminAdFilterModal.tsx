"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminAdFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminAdFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminAdFilterModalProps) {
  const [filters, setFilters] = useState(appliedFilters);

  const handleApply = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value)
    );
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Campaigns</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Campaign Status
            </label>
            <div className="space-y-2">
              {["active", "paused", "completed"].map((status) => (
                <label key={status} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={filters.status === status}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        status: filters.status === e.target.value ? "" : e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Platform
            </label>
            <div className="space-y-2">
              {["facebook", "instagram", "google"].map((platform) => (
                <label key={platform} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={filters.platform === platform}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        platform:
                          filters.platform === e.target.value ? "" : e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Range Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Budget Range
            </label>
            <div className="space-y-2">
              {["£0-5K", "£5K-10K", "£10K-20K", "£20K+"].map((range) => (
                <label key={range} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="budgetRange"
                    value={range}
                    checked={filters.budgetRange === range}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        budgetRange:
                          filters.budgetRange === e.target.value ? "" : e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{range}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply} className="bg-green-600 hover:bg-green-700">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
