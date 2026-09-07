"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  X, Search,
  Wifi, Waves, Snowflake, ChefHat, Dumbbell, Car, TreePine, Flame, Bath, Tv,
  WashingMachine, Lock, Thermometer, Coffee, UtensilsCrossed, Laptop, Wind, Music,
  Sun, Bike, ShowerHead, Sparkles, Gamepad2, Sofa, Dog, BookOpen, Umbrella,
  AirVent, Zap, Key, BedDouble, PawPrint, Utensils, Monitor, Speaker,
  Droplets, Leaf, Shield, Star,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconComponent = React.ComponentType<LucideProps>;

export const AMENITY_ICON_MAP: Record<string, IconComponent> = {
  Wifi, Waves, Snowflake, ChefHat, Dumbbell, Car, TreePine, Flame, Bath, Tv,
  WashingMachine, Lock, Thermometer, Coffee, UtensilsCrossed, Laptop, Wind, Music,
  Sun, Bike, ShowerHead, Sparkles, Gamepad2, Sofa, Dog, BookOpen, Umbrella,
  AirVent, Zap, Key, BedDouble, PawPrint, Utensils, Monitor, Speaker,
  Droplets, Leaf, Shield, Star,
};

const ICON_LABELS: Record<string, string> = {
  Wifi: "WiFi", Waves: "Pool", Snowflake: "AC", ChefHat: "Kitchen",
  Dumbbell: "Gym", Car: "Parking", TreePine: "Garden", Flame: "Heating",
  Bath: "Bathtub", Tv: "Television", WashingMachine: "Laundry", Lock: "Security",
  Thermometer: "Climate", Coffee: "Coffee", UtensilsCrossed: "Dining",
  Laptop: "Workspace", Wind: "Fan", Music: "Music", Sun: "Sunlight",
  Bike: "Bicycle", ShowerHead: "Shower", Sparkles: "Premium", Gamepad2: "Gaming",
  Sofa: "Lounge", Dog: "Pet Friendly", BookOpen: "Library", Umbrella: "Beach",
  AirVent: "Ventilation", Zap: "Power Backup", Key: "Key Lock",
  BedDouble: "Bedroom", PawPrint: "Animals", Utensils: "Cutlery",
  Monitor: "Monitor", Speaker: "Speaker", Droplets: "Water",
  Leaf: "Eco", Shield: "Protected", Star: "Featured",
};

export function renderAmenityIcon(
  iconName: string,
  className = "w-5 h-5"
) {
  const IconComponent = AMENITY_ICON_MAP[iconName];
  if (IconComponent) return <IconComponent className={className} />;
  return <span className="text-base leading-none">{iconName}</span>;
}

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

const AMENITY_CATEGORIES = [
  "Basic", "Entertainment", "Facilities", "Kitchen", "Bathroom",
  "Outdoor", "Safety", "Services", "Sports", "Wellness",
];

export default function AdminAmenityModal({
  isOpen,
  onClose,
  onSave,
  amenity,
  saving = false,
}: AdminAmenityModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Basic");
  const [icon, setIcon] = useState("Sparkles");
  const [error, setError] = useState("");
  const [iconSearch, setIconSearch] = useState("");

  useEffect(() => {
    if (amenity) {
      setName(amenity.name);
      setCategory(amenity.category || "Basic");
      // keep Lucide name if valid, else default
      setIcon(AMENITY_ICON_MAP[amenity.icon] ? amenity.icon : "Sparkles");
    } else {
      setName("");
      setCategory("Basic");
      setIcon("Sparkles");
    }
    setError("");
    setIconSearch("");
  }, [amenity, isOpen]);

  const filteredIcons = Object.keys(AMENITY_ICON_MAP).filter((key) =>
    ICON_LABELS[key]?.toLowerCase().includes(iconSearch.toLowerCase()) ||
    key.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    if (!category) { setError("Category is required"); return; }
    onSave({ name: name.trim(), category, icon });
  };

  if (!isOpen) return null;

  const SelectedIcon = AMENITY_ICON_MAP[icon] ?? Sparkles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg rounded-[5px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
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

          {/* Live Preview */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border rounded-[5px] mb-5">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <SelectedIcon className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {name.trim() || <span className="text-gray-400 font-normal">Amenity name preview...</span>}
              </p>
              <p className="text-xs text-gray-500">{category} · {ICON_LABELS[icon] ?? icon}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., WiFi, Swimming Pool"
                className="rounded-[5px]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                {AMENITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Icon
              </label>
              {/* Icon search */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="pl-8 rounded-[5px] h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-7 gap-1.5 p-3 border rounded-[5px] bg-gray-50 max-h-40 overflow-y-auto">
                {filteredIcons.map((key) => {
                  const IconComp = AMENITY_ICON_MAP[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      title={ICON_LABELS[key] ?? key}
                      onClick={() => setIcon(key)}
                      className={`flex items-center justify-center p-2 rounded-[5px] transition-colors hover:bg-gray-200 ${
                        icon === key ? "bg-green-100 ring-2 ring-green-500" : ""
                      }`}
                    >
                      <IconComp className="w-4 h-4 text-gray-700" />
                    </button>
                  );
                })}
                {filteredIcons.length === 0 && (
                  <p className="col-span-7 text-center text-sm text-gray-400 py-3">No icons found</p>
                )}
              </div>
              {icon && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: <span className="font-medium">{ICON_LABELS[icon] ?? icon}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-[5px] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px] cursor-pointer"
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

