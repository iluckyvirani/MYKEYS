"use client";

import { useState, useEffect } from "react";
import { X, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface OwnerType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
}

interface AdminOwnerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ownerId: string, data: any) => void;
  owner: OwnerType | null;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "INACTIVE", label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-300" },
  { value: "SUSPENDED", label: "Suspended", color: "bg-red-100 text-red-700 border-red-300" },
];

export function AdminOwnerStatusModal({
  isOpen,
  onClose,
  onSave,
  owner,
  loading = false,
}: AdminOwnerStatusModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");

  useEffect(() => {
    if (owner) {
      setFirstName(owner.firstName);
      setLastName(owner.lastName);
      setEmail(owner.email);
      setPhone(owner.phone);
      setSelectedStatus(owner.status.toUpperCase());
    }
  }, [owner]);

  if (!isOpen || !owner) return null;

  const handleSave = () => {
    onSave(owner.id, {
      firstName,
      lastName,
      email,
      phone,
      status: selectedStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 rounded-[5px]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Edit Owner</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Owner Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {owner.firstName} {owner.lastName}
              </p>
              <p className="text-sm text-gray-600">{owner.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                First Name
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-[5px]"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Last Name
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-[5px]"
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[5px]"
                placeholder="Email address"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Phone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-[5px]"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                      selectedStatus === option.value
                        ? option.color
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-[5px]"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-[5px]"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
