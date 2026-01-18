// components/dashboard/OwnerDashboard/PropertyList.tsx
"use client";

import { Building, MapPin, Eye, Edit, MoreVertical, Star, Calendar, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockProperties = [
  {
    id: "PROP001",
    name: "Seaside Luxury Villa",
    location: "Goa, India",
    type: "Villa",
    status: "active", // active, inactive, maintenance, pending
    price: 45000,
    priceType: "per_night",
    occupancy: 85,
    rating: 4.8,
    reviews: 124,
    bookings: 12,
    revenue: 540000,
    image: "/api/placeholder/400/300",
    amenities: ["Pool", "Beach View", "4 Beds", "WiFi"],
    lastBooking: "2024-01-05",
  },
  {
    id: "PROP002",
    name: "Urban Studio Apartment",
    location: "Bangalore, India",
    type: "Apartment",
    status: "active",
    price: 25000,
    priceType: "per_month",
    occupancy: 92,
    rating: 4.5,
    reviews: 89,
    bookings: 8,
    revenue: 200000,
    image: "/api/placeholder/400/300",
    amenities: ["Fully Furnished", "Gym", "Security"],
    lastBooking: "2024-01-10",
  },
  {
    id: "PROP003",
    name: "Mountain View Cottage",
    location: "Shimla, Himachal",
    type: "Cottage",
    status: "maintenance",
    price: 18000,
    priceType: "per_night",
    occupancy: 45,
    rating: 4.9,
    reviews: 67,
    bookings: 5,
    revenue: 90000,
    image: "/api/placeholder/400/300",
    amenities: ["Fireplace", "Mountain View", "Kitchen"],
    lastBooking: "2023-12-28",
  },
  {
    id: "PROP004",
    name: "Luxury Penthouse",
    location: "Mumbai, India",
    type: "Penthouse",
    status: "inactive",
    price: 120000,
    priceType: "per_month",
    occupancy: 0,
    rating: 4.7,
    reviews: 45,
    bookings: 0,
    revenue: 0,
    image: "/api/placeholder/400/300",
    amenities: ["Pool", "Gym", "City View"],
    lastBooking: null,
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        color: "bg-green-100 text-green-800",
        badge: "Active",
        icon: "●",
      };
    case "inactive":
      return {
        color: "bg-gray-100 text-gray-800",
        badge: "Inactive",
        icon: "○",
      };
    case "maintenance":
      return {
        color: "bg-yellow-100 text-yellow-800",
        badge: "Maintenance",
        icon: "⚒",
      };
    case "pending":
      return {
        color: "bg-blue-100 text-blue-800",
        badge: "Pending",
        icon: "⏳",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        badge: "Unknown",
        icon: "?",
      };
  }
};

const getOccupancyColor = (percentage: number) => {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-red-600";
};

export default function PropertyList() {
  const [properties, setProperties] = useState(mockProperties);

  const togglePropertyStatus = (id: string) => {
    setProperties(
      properties.map((prop) =>
        prop.id === id
          ? {
              ...prop,
              status: prop.status === "active" ? "inactive" : "active",
            }
          : prop
      )
    );
  };

  const deleteProperty = (id: string) => {
    setProperties(properties.filter((prop) => prop.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Properties</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track performance of all your listings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Public Listings
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Building className="w-4 h-4 mr-2" />
            Add New Property
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Property
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Occupancy
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Rating
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Revenue
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => {
              const statusConfig = getStatusConfig(property.status);
              const occupancyColor = getOccupancyColor(property.occupancy);

              return (
                <tr key={property.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                        <Building className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {property.name}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {property.location}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {property.type} • {formatCurrency(property.price)}/{property.priceType.split("_")[1]}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.badge}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${property.occupancy >= 80 ? "bg-green-500" : property.occupancy >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${property.occupancy}%` }}
                        ></div>
                      </div>
                      <span className={`font-medium ${occupancyColor}`}>
                        {property.occupancy}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {property.bookings} bookings
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{property.rating}</span>
                      <span className="text-sm text-gray-500">
                        ({property.reviews})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last: {property.lastBooking ? new Date(property.lastBooking).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(property.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      This month
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => togglePropertyStatus(property.id)}>
                            {property.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteProperty(property.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {properties.filter(p => p.status === "active").length}
            </div>
            <div className="text-sm text-gray-600">Active Properties</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {properties.reduce((sum, p) => sum + p.bookings, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(properties.reduce((sum, p) => sum + p.revenue, 0))}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Occupancy</div>
          </div>
        </div>
      </div>
    </div>
  );
}