"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: number;
  status: "active" | "inactive";
  createdDate: string;
  icon?: string;
}

interface AdminCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { name: string; description: string; status: "active" | "inactive"; icon: string }) => void;
  category?: ServiceCategory | null;
  saving?: boolean;
}

export default function AdminCategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  saving = false,
}: AdminCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setStatus(category.status);
      setIcon(category.icon || "");
    } else {
      setName("");
      setDescription("");
      setStatus("active");
      setIcon("");
    }
    setError("");
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!icon.trim()) {
      setError("Icon emoji is required — pick one from the suggestions below or type any emoji");
      return;
    }

    onSave({ name: name.trim(), description: description.trim(), status, icon: icon.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md rounded-[5px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {category ? "Edit Category" : "Add Category"}
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
                placeholder="e.g., Plumbing, Electrical"
                className="rounded-[5px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what services this category includes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Icon field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Emoji) *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Click a suggestion or type any emoji. This icon appears on the category card.
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {["🔧","💡","🪣","🎨","🪚","🧹","❄️","🔌","🏠","🚿","🛠️","🔩","🪟","🔑","📦","🌿"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`text-xl p-1.5 rounded-lg border-2 transition-all hover:scale-110 ${
                      icon === emoji
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded-[5px] bg-gray-50 text-2xl shrink-0">
                  {icon || <span className="text-xs text-gray-400">?</span>}
                </div>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Paste or type an emoji…"
                  className="rounded-[5px]"
                  maxLength={8}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                {saving ? "Saving..." : category ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
