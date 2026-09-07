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
import { Eye, Edit, Trash2, Layers, Check } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: number;
  status: "active" | "inactive";
  createdDate: string;
  icon?: string;
}

interface AdminCategoryListProps {
  categories: ServiceCategory[];
  viewMode: "grid" | "list";
  onView: (category: ServiceCategory) => void;
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
}

const getCategoryColor = (index: number) => {
  const colors = [
    {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "bg-blue-100",
      text: "text-blue-600",
    },
    {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "bg-purple-100",
      text: "text-purple-600",
    },
    {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "bg-green-100",
      text: "text-green-600",
    },
    {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "bg-orange-100",
      text: "text-orange-600",
    },
    {
      bg: "bg-pink-50",
      border: "border-pink-200",
      icon: "bg-pink-100",
      text: "text-pink-600",
    },
    {
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      icon: "bg-cyan-100",
      text: "text-cyan-600",
    },
  ];
  return colors[index % colors.length];
};

export default function AdminCategoryList({
  categories,
  viewMode,
  onView,
  onEdit,
  onDelete,
}: AdminCategoryListProps) {
  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const colors = getCategoryColor(index);

          return (
            <Card
              key={category.id}
              className={`overflow-hidden rounded-[5px] transition-all hover:shadow-xl border-2 ${colors.border}`}
            >
              {/* Color Header */}
              <div className={`${colors.bg} p-6 border-b-2 ${colors.border}`}>
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`${colors.icon} p-4 rounded-lg flex items-center justify-center`}
                  >
                    <Layers className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  {category.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>

              <CardContent className="pt-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Services</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {category.services}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Created</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(category.createdDate).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      {category.services} active services
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Layers className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Available to users</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-[5px] hover:bg-green-50"
                    onClick={() => onView(category)}
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
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={() => onDelete(category.id)}
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
      {categories.map((category, index) => {
        const colors = getCategoryColor(index);

        return (
          <div
            key={category.id}
            className={`flex items-center justify-between p-4 border-2 rounded-[5px] hover:bg-gray-50 transition-colors ${colors.border}`}
          >
            {/* Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className={`${colors.icon} p-3 rounded-lg shrink-0`}>
                <Layers className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {category.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {category.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-8 px-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">Services</p>
                <p className="text-lg font-bold text-gray-900">
                  {category.services}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">Created</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(category.createdDate).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0 ml-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-[5px]"
                onClick={() => onView(category)}
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
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => onDelete(category.id)}
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
