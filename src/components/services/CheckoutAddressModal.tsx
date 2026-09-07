"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationPickerMap, {
  type LocationResult,
} from "@/components/common/LocationPickerMap";

export type CheckoutAddress = {
  formattedAddress: string;
  houseNumber: string;
  landmark: string;
  label: "Home" | "Other";
  contactName: string;
};

export default function CheckoutAddressModal({
  open,
  initial,
  defaultName,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: CheckoutAddress | null;
  defaultName: string;
  onClose: () => void;
  onSave: (address: CheckoutAddress) => void;
}) {
  const [picked, setPicked] = useState<LocationResult | null>(null);
  const [houseNumber, setHouseNumber] = useState(initial?.houseNumber || "");
  const [landmark, setLandmark] = useState(initial?.landmark || "");
  const [label, setLabel] = useState<"Home" | "Other">(initial?.label || "Home");
  const [contactName, setContactName] = useState(
    initial?.contactName || defaultName
  );

  if (!open) return null;

  const formatted =
    picked?.formattedAddress ||
    initial?.formattedAddress ||
    "";

  function handleSave() {
    if (!formatted.trim() || !houseNumber.trim()) return;
    onSave({
      formattedAddress: formatted.trim(),
      houseNumber: houseNumber.trim(),
      landmark: landmark.trim(),
      label,
      contactName: contactName.trim() || defaultName,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border p-1.5 text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
          Address
        </p>
        <h2 className="text-lg font-semibold text-gray-900 mt-1">
          Choose booking location
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Place the pin accurately, then add house or flat details.
        </p>

        <LocationPickerMap
          compact
          height="220px"
          placeholder="Search for your location / postcode"
          onLocationSelect={setPicked}
        />

        {formatted && (
          <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">
              {picked?.city || "Selected location"}
            </p>
            <p className="text-xs text-gray-500">{formatted}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="space-y-1.5">
            <Label>House / Flat number *</Label>
            <Input
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="e.g. 12A"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Landmark (optional)</Label>
            <Input
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Near the park"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-800 mb-2">Save as</p>
          <div className="flex gap-2">
            {(["Home", "Other"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLabel(option)}
                className={`px-4 py-2 rounded-xl border text-sm cursor-pointer ${
                  label === option
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          disabled={!formatted.trim() || !houseNumber.trim()}
          onClick={handleSave}
          className="mt-5 w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white cursor-pointer"
        >
          Save and proceed to slots
        </Button>
      </div>
    </div>
  );
}
