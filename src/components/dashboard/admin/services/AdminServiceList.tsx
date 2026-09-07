"use client";

import { Eye, Edit, Trash2, Star, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ServiceListing {
  id: string;
  name: string;
  category: string;
  provider: string;
  basePrice: number;
  status: "active" | "inactive";
  rating: number;
  bookings: number;
}

interface AdminServiceListProps {
  services: ServiceListing[];
  loading?: boolean;
  empty?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (service: ServiceListing) => void;
}

export function AdminServiceList({
  services,
  loading = false,
  empty = false,
  onEdit,
  onDelete,
  onView,
}: AdminServiceListProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return "text-green-600";
    if (rating >= 4.3) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: "active" | "inactive") => {
    return status === "active" ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusColor = (status: "active" | "inactive") => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading services...</div>;
  }

  if (empty || services.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No services found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Service Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Provider
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Category
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Price
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Bookings
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Rating
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, index) => (
            <tr key={service.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {service.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{service.provider}</td>
              <td className="px-6 py-4 text-sm">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {service.category}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {formatCurrency(service.basePrice)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{service.bookings}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className={`font-semibold ${getRatingColor(service.rating)}`}>
                    {service.rating}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(service.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(service.status)}
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </div>
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onView?.(service)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit?.(service.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete?.(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
