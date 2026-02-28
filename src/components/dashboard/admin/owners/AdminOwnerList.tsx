"use client";

import { Building, Mail, Phone, CheckCircle, XCircle, Eye, Edit, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  properties: number;
  revenue: number;
  status: "active" | "inactive" | "suspended";
  joinedDate: string;
}

interface AdminOwnerListProps {
  owners: Owner[];
  loading: boolean;
  empty: boolean;
  onEdit?: (owner: Owner) => void;
  onDelete?: (owner: Owner) => void;
  onView?: (owner: Owner) => void;
}

export function AdminOwnerList({
  owners,
  loading,
  empty,
  onEdit,
  onDelete,
  onView,
}: AdminOwnerListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case "suspended":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border overflow-hidden">
        <div className="space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="text-center py-16 bg-white rounded-[5px] border">
        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No owners found</h3>
        <p className="text-sm text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Name</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Email</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Phone</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Properties</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Revenue</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Joined</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {owners.map((owner) => (
              <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        {owner.firstName.charAt(0)}{owner.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {owner.firstName} {owner.lastName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">{owner.email}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">{owner.phone}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-900">{owner.properties}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{(owner.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(owner.status)}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(owner.status)}`}>
                      {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-600">
                    {new Date(owner.joinedDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-blue-50"
                      onClick={() => onView?.(owner)}
                      title="View owner details"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-green-50"
                      onClick={() => onEdit?.(owner)}
                      title="Edit owner"
                    >
                      <Edit className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => onDelete?.(owner)}
                      title="Delete owner"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
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
