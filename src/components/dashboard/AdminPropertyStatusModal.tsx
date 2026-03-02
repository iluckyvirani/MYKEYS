"use client";

import { useState, useEffect } from "react";
import { X, Home, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Property {
  id: string;
  title: string;
  location?: string;
  status: string;
  ownerName?: string;
}

interface AdminPropertyStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyId: string, status: string, notes?: string) => void;
  property: Property | null;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-300" },
  { value: "PENDING_REVIEW", label: "Pending Review", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "INACTIVE", label: "Inactive", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "SOLD", label: "Sold", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "RENTED", label: "Rented", color: "bg-purple-100 text-purple-700 border-purple-300" },
];

export function AdminPropertyStatusModal({
  isOpen,
  onClose,
  onSave,
  property,
  loading = false,
}: AdminPropertyStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (property) {
      setSelectedStatus(property.status || "ACTIVE");
      setNotes("");
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleSave = () => {
    onSave(property.id, selectedStatus, notes || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 rounded-[5px]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Update Property Status</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Property Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{property.title}</p>
                {property.location && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{property.location}</span>
                  </div>
                )}
                {property.ownerName && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{property.ownerName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedStatus === option.value
                      ? `${option.color} border-current`
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Admin Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-[5px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px]"
            >
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
