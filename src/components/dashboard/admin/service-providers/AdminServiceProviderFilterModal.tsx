"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
          <DialogTitle>Filter Service Providers</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Status
            </label>
            <div className="space-y-2">
              {["active", "inactive"].map((status) => (
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

          {/* Service Type Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Service Type
            </label>
            <div className="space-y-2">
              {["Plumbing", "Electrical", "Cleaning", "Carpentry", "Painting"].map(
                (type) => (
                  <label key={type} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="serviceType"
                      value={type}
                      checked={filters.serviceType === type}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          serviceType:
                            filters.serviceType === e.target.value ? "" : e.target.value,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Rating Range Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Minimum Rating
            </label>
            <div className="space-y-2">
              {["4.5+", "4.0+", "3.5+"].map((range) => (
                <label key={range} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ratingRange"
                    value={range}
                    checked={filters.ratingRange === range}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        ratingRange:
                          filters.ratingRange === e.target.value ? "" : e.target.value,
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
          <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
