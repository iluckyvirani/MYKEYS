"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminPaymentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminPaymentFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminPaymentFilterModalProps) {
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
          <DialogTitle>Filter Payments</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Payment Status
            </label>
            <div className="space-y-2">
              {["completed", "pending", "failed"].map((status) => (
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

          {/* Payment Method Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              {["Razorpay", "Credit Card", "Google Pay", "UPI", "Net Banking"].map(
                (method) => (
                  <label key={method} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value={method}
                      checked={filters.method === method}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          method:
                            filters.method === e.target.value ? "" : e.target.value,
                        })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{method}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Payment Type Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Transaction Type
            </label>
            <div className="space-y-2">
              {["Booking", "Service", "Subscription"].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={filters.type === type}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        type: filters.type === e.target.value ? "" : e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
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
