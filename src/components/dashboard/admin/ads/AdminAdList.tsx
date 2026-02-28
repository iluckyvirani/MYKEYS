"use client";

import { Eye, Edit, Trash2, CheckCircle, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdCampaign {
  id: string;
  name: string;
  platform: string;
  adType: string;
  status: "active" | "paused" | "completed";
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ownerName: string;
  propertyTitle?: string;
}

interface AdminAdListProps {
  campaigns: AdCampaign[];
  loading?: boolean;
  empty?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (campaign: AdCampaign) => void;
}

export function AdminAdList({
  campaigns,
  loading = false,
  empty = false,
  onEdit,
  onDelete,
  onView,
}: AdminAdListProps) {
  const getStatusIcon = (status: "active" | "paused" | "completed") => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case "completed":
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: "active" | "paused" | "completed") => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "bg-blue-100 text-blue-800";
      case "instagram":
        return "bg-pink-100 text-pink-800";
      case "google":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading campaigns...</div>;
  }

  if (empty || campaigns.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No campaigns found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Campaign Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Owner
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Platform
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Budget
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Performance
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                <div>{campaign.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{campaign.propertyTitle}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{campaign.ownerName}</td>
              <td className="px-6 py-4 text-sm">
                <Badge className={`capitalize ${getPlatformColor(campaign.platform)}`}>
                  {campaign.platform}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(campaign.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(campaign.status)}
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </div>
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  <div className="text-gray-900 font-medium">
                    ₹{campaign.spent.toLocaleString()} / ₹{campaign.budget.toLocaleString()}
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-3">
                  <div>
                    <p className="text-gray-600 text-xs">Impressions</p>
                    <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Conversions</p>
                    <p className="font-semibold text-green-600">{campaign.conversions}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onView?.(campaign)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit?.(campaign.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete?.(campaign.id)}
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
