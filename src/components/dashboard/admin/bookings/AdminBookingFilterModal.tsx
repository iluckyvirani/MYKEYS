"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminBookingFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminBookingFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminBookingFilterModalProps) {
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
          <DialogTitle>Filter Bookings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Booking Status
            </label>
            <div className="space-y-2">
              {["confirmed", "pending", "cancelled"].map((status) => (
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

          {/* Duration Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Stay Duration
            </label>
            <div className="space-y-2">
              {["1-3 nights", "4-7 nights", "8-15 nights", "15+ nights"].map(
                (duration) => (
                  <label key={duration} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="duration"
                      value={duration}
                      checked={filters.duration === duration}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          duration:
                            filters.duration === e.target.value ? "" : e.target.value,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{duration}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Booking Value
            </label>
            <div className="space-y-2">
              {["₹0-50K", "₹50K-100K", "₹100K-200K", "₹200K+"].map((range) => (
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
