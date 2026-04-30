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
import { Eye, Edit, Trash2, MapPin, Star, DollarSign } from "lucide-react";

interface Property {
  id: string;
  title: string;
  owner: string;
  location: string;
  type: string;
  price: number;
  status: "active" | "inactive" | "pending";
  bookings: number;
  images?: Array<{ url: string; isPrimary: boolean }>;
  rating?: number;
  reviewCount?: number;
}

interface AdminPropertyListProps {
  properties: Property[];
  viewMode: "grid" | "list";
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatCurrency = (amount: number) => {
  if (amount >= 100000) {
    return `£${(amount / 100000).toFixed(1)} L`;
  }
  return `£${amount.toLocaleString()}`;
};

const getPrimaryImage = (images?: Array<{ url: string; isPrimary: boolean }>) => {
  if (!images || images.length === 0) return null;
  return images.find((img) => img.isPrimary)?.url || images[0]?.url;
};

export default function AdminPropertyList({
  properties,
  viewMode,
  onView,
  onEdit,
  onDelete,
}: AdminPropertyListProps) {
  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => {
          const image = getPrimaryImage(property.images);

          return (
            <Card
              key={property.id}
              className="overflow-hidden hover:shadow-lg transition-shadow rounded-[5px]"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {image && (
                  <img
                    src={image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {!image && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    className={`border capitalize ${getStatusColor(property.status)}`}
                    variant="secondary"
                  >
                    {property.status}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>

                <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {property.bookings}
                    </div>
                    <div className="text-xs text-gray-600">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {property.type}
                    </div>
                    <div className="text-xs text-gray-600">Type</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">
                      {property.owner?.split(" ")[0]}
                    </div>
                    <div className="text-xs text-gray-600">Owner</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-gray-900">
                      {formatCurrency(property.price)}
                    </span>
                  </div>
                  {property.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{property.rating}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-[5px]"
                    onClick={() => onView(property)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-[5px]">
                        ⋯
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(property)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={() => onDelete(property.id)}
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
      {properties.map((property) => {
        const image = getPrimaryImage(property.images);

        return (
          <div
            key={property.id}
            className="flex items-center gap-4 p-4 border rounded-[5px] hover:bg-gray-50 transition-colors"
          >
            {/* Image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {image && (
                <img
                  src={image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              )}
              {!image && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`border capitalize ${getStatusColor(property.status)}`}
                  variant="secondary"
                >
                  {property.status}
                </Badge>
                <Badge variant="secondary" className="border border-gray-200">
                  {property.type}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6 px-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Bookings</div>
                <div className="font-semibold text-gray-900">
                  {property.bookings}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Type</div>
                <div className="font-semibold text-gray-900">
                  {property.type}
                </div>
              </div>
              {property.rating && (
                <div className="text-center">
                  <div className="text-sm text-gray-600">Rating</div>
                  <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {property.rating}
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="hidden sm:block text-right">
              <div className="text-sm text-gray-600">Price/Night</div>
              <div className="font-bold text-gray-900">
                {formatCurrency(property.price)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="rounded-[5px]"
                onClick={() => onView(property)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-[5px]">
                    ⋯
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(property)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => onDelete(property.id)}
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
