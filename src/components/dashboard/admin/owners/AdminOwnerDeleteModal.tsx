"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OwnerType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AdminOwnerDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ownerId: string) => Promise<void>;
  owner: OwnerType | null;
}

export function AdminOwnerDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  owner,
}: AdminOwnerDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !owner) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(owner.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete owner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 rounded-[5px]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Delete Owner</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Warning Message */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Confirm Deletion</p>
              <p className="text-sm text-red-700 mt-1">
                This action will deactivate the owner account. All properties and bookings will remain but the owner won't be able to access the platform.
              </p>
            </div>
          </div>

          {/* Owner Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-3">Owner to be deleted</p>
            <div>
              <p className="font-semibold text-gray-900">
                {owner.firstName} {owner.lastName}
              </p>
              <p className="text-sm text-gray-600">{owner.email}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Owner"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
