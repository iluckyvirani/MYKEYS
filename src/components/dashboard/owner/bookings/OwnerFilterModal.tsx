"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Filter, X } from "lucide-react";

interface OwnerBookingFilters {
  propertyId?: string;
  status?: string;
  paymentStatus?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
  sortBy?: string;
  search?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: OwnerBookingFilters) => void;
  properties: Array<{ id: string; title: string }>;
  appliedFilters: OwnerBookingFilters;
}

export function OwnerFilterModal({
  isOpen,
  onClose,
  onApply,
  properties,
  appliedFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<OwnerBookingFilters>(appliedFilters || {});

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
  };

  const handlePaymentStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      paymentStatus: prev.paymentStatus === status ? undefined : status,
    }));
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value || undefined,
      },
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: prev.sortBy === sortBy ? undefined : sortBy,
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
          <DialogTitle>Filter Bookings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Search
            </label>
            <Input
              placeholder="Search by guest name, email, or booking ID..."
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

          {/* Booking Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Booking Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"].map(status => (
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

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Payment Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["PENDING", "PAID", "PARTIAL", "REFUNDED", "FAILED"].map(status => (
                <button
                  key={status}
                  onClick={() => handlePaymentStatusChange(status)}
                  className={`px-3 py-2 rounded-[5px] text-sm border transition-colors ${
                    filters.paymentStatus === status
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Check-in From
              </label>
              <Input
                type="date"
                value={filters.dateRange?.from || ""}
                onChange={(e) => handleDateChange('from', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Check-in To
              </label>
              <Input
                type="date"
                value={filters.dateRange?.to || ""}
                onChange={(e) => handleDateChange('to', e.target.value)}
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {["checkIn", "createdAt", "totalAmount"].map(sort => (
                <button
                  key={sort}
                  onClick={() => handleSortChange(sort)}
                  className={`px-3 py-2 rounded-[5px] text-sm border transition-colors ${
                    filters.sortBy === sort
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {sort === "checkIn" ? "Check-in" : sort === "createdAt" ? "Booking Date" : "Amount"}
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
