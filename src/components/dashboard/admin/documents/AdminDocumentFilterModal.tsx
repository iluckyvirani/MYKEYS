"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [filters, setFilters] = useState({
    status: appliedFilters.status || "ALL",
    documentType: appliedFilters.documentType || "ALL",
    userType: appliedFilters.userType || "ALL",
  });

  const handleApply = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value && value !== "ALL")
    );
    onApply(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: "ALL",
      documentType: "ALL",
      userType: "ALL",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Document Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value,
                })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Document Type
            </label>
            <Select
              value={filters.documentType}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  documentType: value,
                })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="ALL">All Types</SelectItem>
                {/* Common documents */}
                <SelectItem value="AADHAR_CARD">Aadhar Card</SelectItem>
                <SelectItem value="PAN_CARD">PAN Card</SelectItem>
                <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                <SelectItem value="PASSPORT">Passport</SelectItem>
                <SelectItem value="VOTER_ID">Voter ID</SelectItem>
                {/* Owner documents */}
                <SelectItem value="PROPERTY_LICENSE">Property License</SelectItem>
                <SelectItem value="BUSINESS_LICENSE">Business License</SelectItem>
                <SelectItem value="GST_CERTIFICATE">GST Certificate</SelectItem>
                <SelectItem value="TAX_IDENTIFICATION">Tax Identification</SelectItem>
                {/* Service documents */}
                <SelectItem value="SERVICE_CERTIFICATE">Service Certificate</SelectItem>
                <SelectItem value="SERVICE_LICENSE">Service/Trade License</SelectItem>
                <SelectItem value="SERVICE_SKILL_CERTIFICATE">Skill Certificate</SelectItem>
                <SelectItem value="SERVICE_EXPERIENCE_LETTER">Experience Letter</SelectItem>
                <SelectItem value="SERVICE_TRAINING_CERTIFICATE">Training Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              User Type
            </label>
            <Select
              value={filters.userType}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  userType: value,
                })
              }
            >
              <SelectTrigger className="w-full rounded-[5px]">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="SERVICE">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1 rounded-[5px]">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px]">
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
