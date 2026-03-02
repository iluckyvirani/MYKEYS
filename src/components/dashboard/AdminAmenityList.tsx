"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, Users, TrendingUp } from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  icon: string;
  propertiesUsing: number;
  status: "active" | "inactive";
}

interface AdminAmenityListProps {
  amenities: Amenity[];
  viewMode: "grid" | "list";
  onView: (amenity: Amenity) => void;
  onEdit: (amenity: Amenity) => void;
  onDelete: (id: string) => void;
}

const getUsageColor = (count: number) => {
  if (count >= 200) {
    return {
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-800",
      text: "text-green-600",
      label: "High",
    };
  } else if (count >= 50) {
    return {
      bg: "bg-blue-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-800",
      text: "text-blue-600",
      label: "Medium",
    };
  } else {
    return {
      bg: "bg-orange-50",
      border: "border-orange-200",
      badge: "bg-orange-100 text-orange-800",
      text: "text-orange-600",
      label: "Low",
    };
  }
};

export default function AdminAmenityList({
  amenities,
  viewMode,
  onView,
  onEdit,
  onDelete,
}: AdminAmenityListProps) {
  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => {
          const usageColor = getUsageColor(amenity.propertiesUsing);

          return (
            <Card
              key={amenity.id}
              className={`overflow-hidden rounded-[5px] transition-all hover:shadow-xl border-2 ${usageColor.border}`}
            >
              {/* Header */}
              <div className={`${usageColor.bg} p-6 border-b-2 ${usageColor.border}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`${usageColor.badge.split(" ")[0]} p-4 rounded-lg flex items-center justify-center text-4xl w-14 h-14`}>
                    {amenity.icon}
                  </div>
                  {amenity.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {amenity.name}
                </h3>
                <Badge className={`mt-2 ${usageColor.badge}`}>
                  {usageColor.label} Usage
                </Badge>
              </div>

              <CardContent className="pt-6">
                {/* Stats */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Users className={`w-5 h-5 ${usageColor.text}`} />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Properties Using</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {amenity.propertiesUsing}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">
                      Used by {amenity.propertiesUsing} properties
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${usageColor.text.replace("text-", "bg-")}`} />
                    <span className="text-gray-700">
                      {usageColor.label} popularity
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-[5px] hover:bg-green-50"
                    onClick={() => onView(amenity)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-[5px]"
                      >
                        ⋯
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(amenity)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={() => onDelete(amenity.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-3">
      {amenities.map((amenity) => {
        const usageColor = getUsageColor(amenity.propertiesUsing);

        return (
          <div
            key={amenity.id}
            className={`flex items-center justify-between p-4 border-2 rounded-[5px] hover:bg-gray-50 transition-colors ${usageColor.border}`}
          >
            {/* Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className={`${usageColor.badge.split(" ")[0]} p-3 rounded-lg flex items-center justify-center text-2xl w-12 h-12`}>
                {amenity.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{amenity.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {amenity.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                  <Badge className={usageColor.badge}>
                    {usageColor.label} Usage
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-8 px-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">Properties</p>
                <p className="text-lg font-bold text-gray-900">
                  {amenity.propertiesUsing}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">Popularity</p>
                <p className={`text-sm font-bold ${usageColor.text}`}>
                  {usageColor.label}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0 ml-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-[5px]"
                onClick={() => onView(amenity)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-[5px]"
                  >
                    ⋯
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(amenity)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => onDelete(amenity.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
