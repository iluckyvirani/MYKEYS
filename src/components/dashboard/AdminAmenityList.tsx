"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, Sparkles } from "lucide-react";
import { renderAmenityIcon } from "./AdminAmenityModal";

interface Amenity {
  id: string;
  name: string;
  icon: string;
  propertiesUsing: number;
  status: "active" | "inactive";
  category?: string;
}

interface AdminAmenityListProps {
  amenities: Amenity[];
  loading?: boolean;
  onEdit: (amenity: Amenity) => void;
  onDelete: (id: string) => void;
}

export default function AdminAmenityList({
  amenities,
  loading,
  onEdit,
  onDelete,
}: AdminAmenityListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border overflow-hidden">
        <div className="space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (amenities.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[5px] border">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No amenities found</h3>
        <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  const getUsageBadge = (count: number) => {
    if (count >= 200) return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">High</span>;
    if (count >= 50)  return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Medium</span>;
    return                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Low</span>;
  };

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Amenity</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Category</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Properties Using</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Popularity</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {amenities.map((amenity) => (
              <tr key={amenity.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 text-green-700">
                      {renderAmenityIcon(amenity.icon, "w-4 h-4")}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{amenity.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600">{amenity.category || "—"}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-gray-900">{amenity.propertiesUsing}</span>
                </td>
                <td className="py-4 px-6">
                  {getUsageBadge(amenity.propertiesUsing)}
                </td>
                <td className="py-4 px-6">
                  {amenity.status === "active" ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                  ) : (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Inactive</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-green-50"
                      onClick={() => onEdit(amenity)}
                      title="Edit amenity"
                    >
                      <Edit className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => onDelete(amenity.id)}
                      title="Delete amenity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
