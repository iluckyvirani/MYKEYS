"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface InquiryFilters {
  propertyId?: string;
  status?: string;
  search?: string;
}

interface InquiryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: InquiryFilters) => void;
  properties: Array<{ id: string; title: string }>;
  appliedFilters: InquiryFilters;
}

export function InquiryFilterModal({
  isOpen,
  onClose,
  onApply,
  properties,
  appliedFilters,
}: InquiryFilterModalProps) {
  const [filters, setFilters] = useState<InquiryFilters>(appliedFilters || {});

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filter Inquiries</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Search
            </label>
            <Input
              placeholder="Search by guest name or email..."
              value={filters.search || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
            />
          </div>

          {/* Properties */}
          {properties.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property
              </label>
              <select
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
                value={filters.propertyId || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, propertyId: e.target.value || undefined }))}
              >
                <option value="">All Properties</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Inquiry Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["NEW", "READ", "REPLIED", "CLOSED"].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-2 rounded-[5px] text-sm border transition-colors ${
                    filters.status === status
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
