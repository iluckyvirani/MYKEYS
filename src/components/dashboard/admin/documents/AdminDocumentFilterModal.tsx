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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[
                // Common documents
                { value: "AADHAR_CARD", label: "Aadhar Card" },
                { value: "PAN_CARD", label: "PAN Card" },
                { value: "DRIVING_LICENSE", label: "Driving License" },
                { value: "PASSPORT", label: "Passport" },
                { value: "VOTER_ID", label: "Voter ID" },
                // Owner documents
                { value: "PROPERTY_LICENSE", label: "Property License" },
                { value: "BUSINESS_LICENSE", label: "Business License" },
                { value: "GST_CERTIFICATE", label: "GST Certificate" },
                { value: "TAX_IDENTIFICATION", label: "Tax Identification" },
                // Service documents
                { value: "SERVICE_CERTIFICATE", label: "Service Certificate" },
                { value: "SERVICE_LICENSE", label: "Service/Trade License" },
                { value: "SERVICE_SKILL_CERTIFICATE", label: "Skill Certificate" },
                { value: "SERVICE_EXPERIENCE_LETTER", label: "Experience Letter" },
                { value: "SERVICE_TRAINING_CERTIFICATE", label: "Training Certificate" },
              ].map((type) => (
                <label key={type.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="documentType"
                    value={type.value}
                    checked={filters.documentType === type.value}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        documentType:
                          filters.documentType === e.target.value ? "" : e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* User Type Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              User Type
            </label>
            <div className="space-y-2">
              {[
                { value: "USER", label: "User" },
                { value: "OWNER", label: "Owner" },
                { value: "SERVICE", label: "Service Provider" },
              ].map((type) => (
                <label key={type.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value={type.value}
                    checked={filters.userType === type.value}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        userType:
                          filters.userType === e.target.value ? "" : e.target.value,
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">{type.label}</span>
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
