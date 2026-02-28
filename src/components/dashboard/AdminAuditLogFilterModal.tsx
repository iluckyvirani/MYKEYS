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

interface AdminAuditLogFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    action: string;
    entity: string;
  };
  onApplyFilters: (filters: { action: string; entity: string }) => void;
  onResetFilters: () => void;
}

const actions = ["ALL", "CREATE", "UPDATE", "DELETE"];
const entities = [
  "ALL",
  "Property",
  "User",
  "Booking",
  "Payment",
  "Document",
  "Amenity",
  "Package",
  "Inquiry",
  "Review",
  "Service",
];

export default function AdminAuditLogFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: AdminAuditLogFilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ action: "ALL", entity: "ALL" });
    onResetFilters();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Audit Logs</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Action Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Action Type
            </label>
            <div className="space-y-2">
              {actions.map((action) => (
                <label key={action} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="action"
                    value={action}
                    checked={localFilters.action === action}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        action: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {action === "ALL" ? "All Actions" : action}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Entity Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Entity Type
            </label>
            <div className="space-y-2">
              {entities.map((entity) => (
                <label key={entity} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="entity"
                    value={entity}
                    checked={localFilters.entity === entity}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        entity: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {entity === "ALL" ? "All Entities" : entity}
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
