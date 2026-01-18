"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Heart, Filter, Share2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FavoriteGrid from "@/components/dashboard/UserDashboard/FavoriteGrid";

export default function FavoritesPage() {
  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Favorite Properties</h1>
            <p className="text-gray-600 mt-2">
              Your saved properties and price alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="cursor-pointer rounded-[5px]">
              <Share2 className="w-4 h-4 mr-2" />
              Share List
            </Button>
            <Button className="cursor-pointer rounded-[5px]">
              <Heart className="w-4 h-4 mr-2" />
              Browse More
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-sm text-gray-600">Total Saved</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">Price Drops</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-blue-600">6</div>
          <div className="text-sm text-gray-600">Available Now</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-yellow-600">2</div>
          <div className="text-sm text-gray-600">Recently Viewed</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[5px] p-5 mb-5 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search favorite properties..."
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <select className="border rounded-[5px] px-4 py-2 text-sm w-full md:w-auto">
              <option>All Properties</option>
              <option>With Price Drops</option>
              <option>Available Now</option>
              <option>Recently Added</option>
              <option>By Property Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      <FavoriteGrid />
    </DashboardLayout>
  );
}