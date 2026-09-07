"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, User, DollarSign, Clock } from "lucide-react";

interface ServiceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
  providerName: string;
  providerId: string;
  createdAt: string;
}

interface ServiceListingsTableProps {
  listings: ServiceListing[];
  loading: boolean;
}

export function ServiceListingsTable({ listings, loading }: ServiceListingsTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-3">Loading service listings...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No service listings found for this category</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Provider</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div>
                  <div className="font-medium text-gray-900">{listing.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">{listing.description}</div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-900">{listing.providerName}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-gray-900 font-medium">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(listing.basePrice)}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Clock className="w-4 h-4" />
                  {listing.duration} min
                </div>
              </td>
              <td className="py-4 px-4">
                <Badge
                  variant={listing.isActive ? "default" : "secondary"}
                  className={`${
                    listing.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {listing.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="py-4 px-4 text-sm text-gray-600">
                {new Date(listing.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-yellow-50 hover:text-yellow-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600"
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
