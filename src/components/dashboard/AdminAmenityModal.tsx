"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  icon: string;
  propertiesUsing: number;
  status: "active" | "inactive";
  category?: string;
}

interface AdminAmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amenity: { name: string; category: string; icon: string }) => void;
  amenity?: Amenity | null;
  saving?: boolean;
}

const AMENITY_ICONS = [
  "📶", "🏊", "❄️", "🍳", "💪", "🚗", "🌳", "🔥", "🛁", "📺",
  "🧺", "🔐", "🛗", "🌡️", "🎮", "☕", "🍽️", "🛏️", "💻", "🏋️",
  "🎵", "🌊", "🎾", "⛳", "🏀", "🎱", "🧘", "🚿", "🛀", "✨"
];

const AMENITY_CATEGORIES = [
  "Basic",
  "Entertainment",
  "Facilities",
  "Kitchen",
  "Bathroom",
  "Outdoor",
  "Safety",
  "Services",
  "Sports",
  "Wellness"
];

export default function AdminAmenityModal({
  isOpen,
  onClose,
  onSave,
  amenity,
  saving = false,
}: AdminAmenityModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("✨");
  const [error, setError] = useState("");

  useEffect(() => {
    if (amenity) {
      setName(amenity.name);
      setCategory(amenity.category || "Basic");
      setIcon(amenity.icon || "✨");
    } else {
      setName("");
      setCategory("Basic");
      setIcon("✨");
    }
    setError("");
  }, [amenity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }

    onSave({ name: name.trim(), category, icon });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md rounded-[5px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {amenity ? "Edit Amenity" : "Add Amenity"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., WiFi, Swimming Pool"
                className="rounded-[5px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category</option>
                {AMENITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-10 gap-2 p-3 border rounded-[5px] bg-gray-50 max-h-32 overflow-y-auto">
                {AMENITY_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`text-2xl p-1 rounded hover:bg-gray-200 transition-colors ${
                      icon === emoji ? "bg-green-100 ring-2 ring-green-500" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Selected: <span className="text-2xl">{icon}</span>
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-[5px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px]"
              >
                {saving ? "Saving..." : amenity ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
