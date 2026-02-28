"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminServiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminServiceFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminServiceFilterModalProps) {
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
          <DialogTitle>Filter Services</DialogTitle>
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

          {/* Category Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Category
            </label>
            <div className="space-y-2">
              {["Cleaning", "Maintenance", "Electrical", "Interior Design", "Gardening"].map(
                (category) => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={filters.category === category}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          category:
                            filters.category === e.target.value ? "" : e.target.value,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Price Range
            </label>
            <div className="space-y-2">
              {["₹0-500", "₹500-1000", "₹1000-2000", "₹2000+"].map((range) => (
                <label key={range} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    value={range}
                    checked={filters.priceRange === range}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange:
                          filters.priceRange === e.target.value ? "" : e.target.value,
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
