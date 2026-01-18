"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Eye,
  Target,
  Calendar,
  Edit,
  Pause,
  Play,
  Facebook,
  Instagram,
  Search,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const campaigns = [
  {
    id: "AD001",
    name: "Seaside Villa Summer Promotion",
    property: "Seaside Luxury Villa",
    platform: "facebook",
    status: "active", // active, paused, completed, draft
    budget: 50000,
    spent: 32500,
    duration: "30 days",
    startDate: "2024-01-01",
    endDate: "2024-01-30",
    impressions: 45000,
    clicks: 2200,
    ctr: 4.9,
    conversions: 8,
    cpc: 14.77,
    roas: 3.2,
    target: "Families, Vacationers",
    locations: ["Mumbai", "Delhi", "Bangalore"],
    adType: "image_carousel",
  },
  {
    id: "AD002",
    name: "Luxury Apartment City Campaign",
    property: "Modern 2BHK Apartment",
    platform: "instagram",
    status: "active",
    budget: 30000,
    spent: 18500,
    duration: "25 days",
    startDate: "2024-01-05",
    endDate: "2024-01-29",
    impressions: 32000,
    clicks: 1500,
    ctr: 4.7,
    conversions: 5,
    cpc: 12.33,
    roas: 2.8,
    target: "Professionals, Couples",
    locations: ["Bangalore", "Hyderabad"],
    adType: "video",
  },
  {
    id: "AD003",
    name: "Mountain Retreat Weekend Getaway",
    property: "Mountain View Cottage",
    platform: "google",
    status: "paused",
    budget: 20000,
    spent: 8500,
    duration: "20 days",
    startDate: "2024-01-10",
    endDate: "2024-01-29",
    impressions: 18000,
    clicks: 800,
    ctr: 4.4,
    conversions: 3,
    cpc: 10.63,
    roas: 3.5,
    target: "Couples, Adventure Seekers",
    locations: ["Delhi", "Chandigarh"],
    adType: "search",
  },
  {
    id: "AD004",
    name: "Penthouse Luxury Living",
    property: "Luxury Penthouse",
    platform: "facebook",
    status: "completed",
    budget: 75000,
    spent: 75000,
    duration: "45 days",
    startDate: "2023-12-01",
    endDate: "2024-01-14",
    impressions: 95000,
    clicks: 4200,
    ctr: 4.4,
    conversions: 12,
    cpc: 17.86,
    roas: 4.1,
    target: "High-income, Business Travelers",
    locations: ["Mumbai", "Delhi", "International"],
    adType: "collection",
  },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "facebook":
      return { icon: Facebook, color: "bg-blue-100 text-blue-600" };
    case "instagram":
      return { icon: Instagram, color: "bg-pink-100 text-pink-600" };
    case "google":
      return { icon: Search, color: "bg-red-100 text-red-600" };
    default:
      return { icon: Target, color: "bg-gray-100 text-gray-600" };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { color: "bg-green-100 text-green-800", label: "Active" };
    case "paused":
      return { color: "bg-yellow-100 text-yellow-800", label: "Paused" };
    case "completed":
      return { color: "bg-blue-100 text-blue-800", label: "Completed" };
    case "draft":
      return { color: "bg-gray-100 text-gray-800", label: "Draft" };
    default:
      return { color: "bg-gray-100 text-gray-800", label: "Unknown" };
  }
};

const getROASColor = (roas: number) => {
  if (roas >= 4) return "text-green-600";
  if (roas >= 2.5) return "text-yellow-600";
  return "text-red-600";
};

export default function ActiveCampaigns() {
  const [campaignsList, setCampaignsList] = useState(campaigns);

  const toggleCampaignStatus = (id: string) => {
    setCampaignsList(
      campaignsList.map(campaign =>
        campaign.id === id
          ? {
              ...campaign,
              status: campaign.status === "active" ? "paused" : "active",
            }
          : campaign
      )
    );
  };

  const duplicateCampaign = (id: string) => {
    const campaignToDuplicate = campaignsList.find(c => c.id === id);
    if (campaignToDuplicate) {
      const newCampaign = {
        ...campaignToDuplicate,
        id: `AD${String(Number(campaignsList.length + 1)).padStart(3, '0')}`,
        name: `${campaignToDuplicate.name} (Copy)`,
        status: "draft",
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };
      setCampaignsList([...campaignsList, newCampaign]);
    }
  };

  const deleteCampaign = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      setCampaignsList(campaignsList.filter(campaign => campaign.id !== id));
    }
  };

  const activeCampaigns = campaignsList.filter(c => c.status === "active").length;
  const totalBudget = campaignsList.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaignsList.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor all your advertising campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            + New Campaign
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="text-sm text-gray-600">Active Campaigns</div>
          <div className="text-xl font-bold text-gray-900">{activeCampaigns}</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-sm text-gray-600">Total Budget</div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totalBudget)}
          </div>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <div className="text-sm text-gray-600">Amount Spent</div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totalSpent)}
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="text-sm text-gray-600">Remaining</div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totalBudget - totalSpent)}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Campaign</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Platform</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Performance</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Budget</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaignsList.map((campaign) => {
              const platformConfig = getPlatformIcon(campaign.platform);
              const PlatformIcon = platformConfig.icon;
              const statusConfig = getStatusConfig(campaign.status);
              const roasColor = getROASColor(campaign.roas);
              const daysRemaining = Math.ceil(
                (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <tr key={campaign.id} className="border-b hover:bg-gray-50 group">
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-600">{campaign.property}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {campaign.locations.join(", ")}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${platformConfig.color}`}>
                        <PlatformIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">{campaign.platform}</div>
                        <div className="text-xs text-gray-500 capitalize">{campaign.adType.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {campaign.status === "active" && daysRemaining > 0 && (
                        <div className="text-xs text-gray-500">
                          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">CTR</span>
                        <span className="font-medium">{campaign.ctr}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ROAS</span>
                        <span className={`font-medium ${roasColor}`}>{campaign.roas}x</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {campaign.impressions.toLocaleString()} views
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Spent</span>
                        <span className="font-medium">{formatCurrency(campaign.spent)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Budget</span>
                        <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-green-500"
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleCampaignStatus(campaign.id)}
                      >
                        {campaign.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
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
                          <DropdownMenuItem onClick={() => duplicateCampaign(campaign.id)}>
                            Duplicate Campaign
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem>Download Report</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteCampaign(campaign.id)}>
                            Delete Campaign
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

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {campaignsList.length} campaigns • {activeCampaigns} active • 
            Avg ROAS: {(campaignsList.reduce((sum, c) => sum + c.roas, 0) / campaignsList.length).toFixed(1)}x
          </div>
          <Button variant="outline">
            View All Campaigns
          </Button>
        </div>
      </div>
    </div>
  );
}