"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminDocumentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  appliedFilters?: any;
}

export function AdminDocumentFilterModal({
  isOpen,
  onClose,
  onApply,
  appliedFilters = {},
}: AdminDocumentFilterModalProps) {
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
          <DialogTitle>Filter Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Document Status
            </label>
            <div className="space-y-2">
              {["pending", "approved", "rejected"].map((status) => (
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

          {/* Document Type Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Document Type
            </label>
            <div className="space-y-2">
              {["Aadhar Card", "PAN Card", "Driving License", "Passport", "Voter ID"].map(
                (type) => (
                  <label key={type} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="documentType"
                      value={type}
                      checked={filters.documentType === type}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          documentType:
                            filters.documentType === e.target.value ? "" : e.target.value,
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

          {/* User Type Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              User Type
            </label>
            <div className="space-y-2">
              {["Owner", "User", "Service Provider"].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value={type}
                    checked={filters.userType === type}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        userType:
                          filters.userType === e.target.value ? "" : e.target.value,
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
