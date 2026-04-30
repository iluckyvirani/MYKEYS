"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminAdFilterModal } from "@/components/dashboard/admin/ads/AdminAdFilterModal";
import { AdminAdList } from "@/components/dashboard/admin/ads/AdminAdList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Search, Plus, Filter, Download, X, Zap, TrendingUp, Users, DollarSign } from "lucide-react";

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
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !appliedFilters.status || campaign.status === appliedFilters.status;
    
    const matchesPlatform = !appliedFilters.platform || campaign.platform === appliedFilters.platform;
    
    let matchesBudget = true;
    if (appliedFilters.budgetRange) {
      const ranges: { [key: string]: [number, number] } = {
        "£0-5K": [0, 5000],
        "£5K-10K": [5000, 10000],
        "£10K-20K": [10000, 20000],
        "£20K+": [20000, Infinity],
      };
      const [min, max] = ranges[appliedFilters.budgetRange] || [0, Infinity];
      matchesBudget = campaign.budget >= min && campaign.budget <= max;
    }

    return matchesSearch && matchesStatus && matchesPlatform && matchesBudget;
  });

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowAppliedFilters(Object.keys(filters).length > 0);
  };

  const handleClearFilter = (filterKey: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    setAppliedFilters(newFilters);
    setShowAppliedFilters(Object.keys(newFilters).length > 0);
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setShowAppliedFilters(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setCampaigns(campaigns.filter((c) => c.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  // Calculate stats
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const pausedCampaigns = campaigns.filter((c) => c.status === "paused").length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ads & Campaigns</h1>
            <p className="text-gray-600 mt-2">
              Manage advertising campaigns and featured listings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
                <div className="text-sm text-gray-600">Total Campaigns</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeCampaigns} active</span>
              <span className="text-gray-500 ml-2">• {pausedCampaigns} paused</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">£{(totalBudget / 100000).toFixed(2)}L</div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Allocated budget
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">£{(totalSpent / 100000).toFixed(2)}L</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Funds used
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalConversions.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Conversions</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Total leads generated
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-[5px] border p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search campaigns or owner..."
                  className="pl-10 w-full rounded-[5px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Applied Filters Display */}
          {showAppliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {appliedFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Status: {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.platform && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Platform: {appliedFilters.platform}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("platform")}
                  />
                </Badge>
              )}
              {appliedFilters.budgetRange && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Budget: {appliedFilters.budgetRange}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("budgetRange")}
                  />
                </Badge>
              )}
              {Object.keys(appliedFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Campaign List */}
        <AdminAdList
          campaigns={filteredCampaigns}
          loading={loading}
          empty={filteredCampaigns.length === 0}
          onDelete={handleDelete}
          onView={setSelectedCampaign}
          onEdit={() => {}}
        />

        {/* Campaign Details Modal */}
        {selectedCampaign && (
          <Card className="border-2 border-green-600 p-6 rounded-[5px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{selectedCampaign.propertyTitle}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedCampaign(null)}
                className="rounded-[5px]"
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
                    <Badge className="mt-1 capitalize">
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
                    <p className="font-semibold text-lg">£{selectedCampaign.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Spent</p>
                    <p className="font-semibold text-green-600">£{selectedCampaign.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining</p>
                    <p className="font-semibold">£{(selectedCampaign.budget - selectedCampaign.spent).toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                    <div
                      className="bg-linear-to-r from-green-600 to-emerald-500 h-3 rounded-full"
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

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm rounded-[5px]">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Campaign</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this campaign? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    className="rounded-[5px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    className="rounded-[5px]"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Modal */}
        <AdminAdFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
      </div>
    </AdminDashboardLayout>
  );
}
