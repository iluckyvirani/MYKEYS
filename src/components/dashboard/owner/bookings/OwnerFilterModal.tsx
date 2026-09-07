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
          {/* Properties */}
          {properties.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property
              </label>
              <select
                className="w-full border border-gray-300 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <select
              className="w-full border border-gray-300 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.status || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Payment Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.paymentStatus || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value || undefined }))}
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
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
            <select
              className="w-full border border-gray-300 rounded-[5px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.sortBy || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value || undefined }))}
            >
              <option value="">Default (Recent)</option>
              <option value="checkIn">Check-in Date</option>
              <option value="createdAt">Booking Date</option>
              <option value="totalAmount">Amount</option>
            </select>
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
