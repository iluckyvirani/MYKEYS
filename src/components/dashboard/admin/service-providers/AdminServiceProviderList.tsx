"use client";

import { Eye, Edit, Trash2, Star, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceProvider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  serviceType: string;
  bookings: number;
  rating: number;
  status: "active" | "inactive";
}

interface AdminServiceProviderListProps {
  providers: ServiceProvider[];
  loading?: boolean;
  empty?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (provider: ServiceProvider) => void;
}

export function AdminServiceProviderList({
  providers,
  loading = false,
  empty = false,
  onEdit,
  onDelete,
  onView,
}: AdminServiceProviderListProps) {
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
    return <div className="text-center py-10 text-gray-500">Loading providers...</div>;
  }

  if (empty || providers.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No service providers found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Email
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Service Type
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
          {providers.map((provider) => (
            <tr key={provider.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {provider.firstName} {provider.lastName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{provider.email}</td>
              <td className="px-6 py-4 text-sm">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {provider.serviceType}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{provider.bookings}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className={`font-semibold ${getRatingColor(provider.rating)}`}>
                    {provider.rating}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(provider.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(provider.status)}
                    {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                  </div>
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onView?.(provider)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit?.(provider.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete?.(provider.id)}
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
