"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Edit, Trash2, Search, Eye, Zap } from "lucide-react";
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

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    {
      id: "1",
      name: "Summer Promotions",
      platform: "facebook",
      adType: "carousel",
      status: "active",
      budget: 10000,
      spent: 4500,
      startDate: "2026-02-01",
      endDate: "2026-02-28",
      impressions: 245000,
      clicks: 8900,
      conversions: 340,
      ownerName: "Rajesh Kumar",
      propertyTitle: "Luxury Villa in Mumbai",
    },
    {
      id: "2",
      name: "Winter Deals",
      platform: "instagram",
      adType: "image",
      status: "active",
      budget: 5000,
      spent: 2800,
      startDate: "2026-02-05",
      endDate: "2026-02-15",
      impressions: 120000,
      clicks: 4200,
      conversions: 156,
      ownerName: "Priya Sharma",
      propertyTitle: "Beachfront Apartment",
    },
    {
      id: "3",
      name: "Premium Properties",
      platform: "google",
      adType: "video",
      status: "active",
      budget: 15000,
      spent: 12000,
      startDate: "2026-01-15",
      endDate: "2026-03-15",
      impressions: 450000,
      clicks: 18900,
      conversions: 890,
      ownerName: "Amit Patel",
      propertyTitle: "Commercial Space Downtown",
    },
    {
      id: "4",
      name: "Spring Launch",
      platform: "facebook",
      adType: "image",
      status: "paused",
      budget: 8000,
      spent: 3200,
      startDate: "2026-02-10",
      endDate: "2026-03-10",
      impressions: 85000,
      clicks: 2100,
      conversions: 67,
      ownerName: "Neha Singh",
      propertyTitle: "Residential Complex",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateROI = (spent: number, conversions: number) => {
    if (spent === 0) return 0;
    return ((conversions * 1000 - spent) / spent * 100).toFixed(2);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      setCampaigns(campaigns.filter((c) => c.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c
      )
    );
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-8 h-8 text-green-600" />
              Ads & Campaigns
            </h1>
            <p className="text-gray-600 mt-1">Manage advertising campaigns and featured listings</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search campaigns or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Campaign Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Budget</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-600">{campaign.propertyTitle}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{campaign.ownerName}</td>
                    <td className="py-3 px-4">
                      <Badge className={`capitalize ${getPlatformColor(campaign.platform)}`}>
                        {campaign.platform}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`capitalize ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">₹{campaign.spent.toLocaleString()} / ₹{campaign.budget.toLocaleString()}</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="flex gap-2">
                          <div>
                            <p className="text-gray-600">Impressions</p>
                            <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Conversions</p>
                            <p className="font-semibold text-green-600">{campaign.conversions}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(campaign.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDelete(campaign.id)}
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
        </Card>

        {/* Campaign Details */}
        {selectedCampaign && (
          <Card className="border-2 border-green-600 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedCampaign.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{selectedCampaign.propertyTitle}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedCampaign(null)}
              >
                ✕
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Campaign Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Campaign Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Platform</p>
                    <p className="font-semibold capitalize">{selectedCampaign.platform}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ad Type</p>
                    <p className="font-semibold capitalize">{selectedCampaign.adType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge className={`mt-1 ${getStatusColor(selectedCampaign.status)}`}>
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Owner</p>
                    <p className="font-semibold">{selectedCampaign.ownerName}</p>
                  </div>
                </div>
              </div>

              {/* Budget Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Budget & Spending</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Total Budget</p>
                    <p className="font-semibold text-lg">₹{selectedCampaign.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Spent</p>
                    <p className="font-semibold text-green-600">₹{selectedCampaign.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining</p>
                    <p className="font-semibold">₹{(selectedCampaign.budget - selectedCampaign.spent).toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-600 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${(selectedCampaign.spent / selectedCampaign.budget) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Performance</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Impressions</p>
                    <p className="font-semibold">{selectedCampaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Clicks</p>
                    <p className="font-semibold">{selectedCampaign.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conversions</p>
                    <p className="font-semibold text-green-600">{selectedCampaign.conversions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">CTR</p>
                    <p className="font-semibold">
                      {((selectedCampaign.clicks / selectedCampaign.impressions) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
