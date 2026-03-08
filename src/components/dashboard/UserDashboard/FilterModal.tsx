"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingStatus } from "@/types/bookings";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    status?: string;
    paymentStatus?: string;
    bookingType?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
  }) => void;
}

export  function FilterModal({
  isOpen,
  onClose,
  onApply,
}: FilterModalProps) {
  const [status, setStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");

  const handleApply = () => {
    onApply({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setStatus("");
    setPaymentStatus("");
    setFromDate("");
    setToDate("");
    setSortBy("recent");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Filter Bookings</DialogTitle>
          <DialogDescription>
            Apply filters to view specific bookings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Booking Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Statuses</option>
              <option value={BookingStatus.PENDING}>Pending</option>
              <option value={BookingStatus.CONFIRMED}>Confirmed</option>
              <option value={BookingStatus.COMPLETED}>Completed</option>
              <option value={BookingStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Check-in Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="From"
                  className="rounded-[5px]"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="To"
                  className="rounded-[5px]"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 rounded-[5px]"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 rounded-[5px]"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export  function ServicebookingFilterModal({
  isOpen,
  onClose,
  onApply,
}: FilterModalProps) {
  const [status, setStatus] = useState<string>("");
  const [bookingType, setBookingType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");

  const handleApply = () => {
    onApply({
      status: status || undefined,
      bookingType: bookingType || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setStatus("");
    setBookingType("");
    setFromDate("");
    setToDate("");
    setSortBy("recent");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Filter Service Bookings</DialogTitle>
          <DialogDescription>
            Apply filters to view specific service bookings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Booking Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Booking Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Booking Type
            </label>
            <select
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Types</option>
              <option value="instant">Instant Booking</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {/* Service Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Service Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="From"
                  className="rounded-[5px]"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="To"
                  className="rounded-[5px]"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 rounded-[5px]"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 rounded-[5px]"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inquiry Filter Modal ──────────────────────────────────────────────────────

interface InquiryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { status?: string; fromDate?: string; toDate?: string; sortBy?: string }) => void;
}

export function InquiryFilterModal({ isOpen, onClose, onApply }: InquiryFilterModalProps) {
  const [status, setStatus] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");

  const handleApply = () => {
    onApply({ status: status || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined, sortBy });
    onClose();
  };

  const handleReset = () => { setStatus(""); setFromDate(""); setToDate(""); setSortBy("recent"); };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Filter Inquiries</DialogTitle>
          <DialogDescription>Apply filters to view specific inquiries</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Inquiry Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Statuses</option>
              <option value="NEW">New / Pending</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="CONVERTED">Converted</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Date Sent Range</label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-[5px]" />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-[5px]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1 rounded-[5px]">Reset</Button>
          <Button onClick={handleApply} className="flex-1 rounded-[5px]">Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Favorite Filter Modal ─────────────────────────────────────────────────────

interface FavoriteFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { propertyType?: string; sortBy?: string }) => void;
}

export function FavoriteFilterModal({ isOpen, onClose, onApply }: FavoriteFilterModalProps) {
  const [propertyType, setPropertyType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const handleApply = () => {
    onApply({ propertyType: propertyType !== "all" ? propertyType : undefined, sortBy });
    onClose();
  };

  const handleReset = () => { setPropertyType("all"); setSortBy("recent"); };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Filter Favorites</DialogTitle>
          <DialogDescription>Apply filters to view specific favorite properties</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Property Type</label>
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All Properties</option>
              <option value="short">Short Stay</option>
              <option value="long">Long Rent</option>
              <option value="buy">For Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="recent">Recently Added</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1 rounded-[5px]">Reset</Button>
          <Button onClick={handleApply} className="flex-1 rounded-[5px]">Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Payment Filter Modal ──────────────────────────────────────────────────────

interface PaymentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { paymentMethod?: string; fromDate?: string; toDate?: string; sortBy?: string }) => void;
}

export function PaymentFilterModal({ isOpen, onClose, onApply }: PaymentFilterModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");

  const handleApply = () => {
    onApply({ paymentMethod: paymentMethod || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined, sortBy });
    onClose();
  };

  const handleReset = () => { setPaymentMethod(""); setFromDate(""); setToDate(""); setSortBy("recent"); };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Filter Payments</DialogTitle>
          <DialogDescription>Apply filters to view specific payments</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Methods</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="CASH">Cash</option>
              <option value="WALLET">Wallet</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Payment Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-[5px]" />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-[5px]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1 rounded-[5px]">Reset</Button>
          <Button onClick={handleApply} className="flex-1 rounded-[5px]">Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Service Filter Modal ──────────────────────────────────────────────────────

interface ServiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { category?: string; bookingType?: string }) => void;
}

export function ServiceFilterModal({ isOpen, onClose, onApply }: ServiceFilterModalProps) {
  const [category, setCategory] = useState<string>("");
  const [bookingType, setBookingType] = useState<string>("");

  const handleApply = () => {
    onApply({ category: category || undefined, bookingType: bookingType || undefined });
    onClose();
  };

  const handleReset = () => { setCategory(""); setBookingType(""); };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Filter Services</DialogTitle>
          <DialogDescription>Filter services by category or booking type</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Categories</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Cleaning">Cleaning</option>
              <option value="HVAC">HVAC</option>
              <option value="Home Improvement">Home Improvement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Booking Type</label>
            <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} className="w-full px-3 py-2 border rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Types</option>
              <option value="instant">Instant Available</option>
              <option value="schedule">Schedule Only</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1 rounded-[5px]">Reset</Button>
          <Button onClick={handleApply} className="flex-1 rounded-[5px]">Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}