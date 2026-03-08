"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Heart, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FavoriteGrid from "@/components/dashboard/UserDashboard/FavoriteGrid";
import { FavoriteFilterModal } from "@/components/dashboard/UserDashboard/FilterModal";
import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

interface FavoriteFilters {
  propertyType?: string;
  sortBy?: string;
}

export default function FavoritesPage() {
  const [stats, setStats] = useState({
    totalSaved: 0,
    priceDrops: 0,
    availableNow: 0,
    recentlyViewed: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FavoriteFilters | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const handleStatsChange = useCallback((next: any) => {
    setStats((prev) => ({
      ...prev,
      totalSaved: next.totalSaved,
      availableNow: next.availableNow,
    }));
  }, []);

  const handleApplyFilters = (filters: FavoriteFilters) => {
    setAppliedFilters(filters);
    setFilterModalOpen(false);
  };

  const removeFilter = (key: keyof FavoriteFilters) => {
    if (!appliedFilters) return;
    const updated = { ...appliedFilters };
    delete updated[key];
    setAppliedFilters(Object.keys(updated).length > 0 ? updated : null);
  };

  const activeFilterChips = appliedFilters
    ? Object.entries(appliedFilters).filter(([, v]) => v && v !== "all" && v !== "recent")
    : [];

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
            <Link href="/">
              <Button className="cursor-pointer rounded-[5px]">
                <Heart className="w-4 h-4 mr-2" />
                Browse More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-gray-900">{stats.totalSaved}</div>
          <div className="text-sm text-gray-600">Total Saved</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-green-600">{stats.priceDrops}</div>
          <div className="text-sm text-gray-600">Price Drops</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-blue-600">{stats.availableNow}</div>
          <div className="text-sm text-gray-600">Available Now</div>
        </div>
        <div className="bg-white p-6 rounded-[5px] border">
          <div className="text-2xl font-bold text-yellow-600">{stats.recentlyViewed}</div>
          <div className="text-sm text-gray-600">Recently Viewed</div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-[5px] p-5 mb-3 border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search favorite properties..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterModalOpen(true)}
            className="rounded-[5px] whitespace-nowrap"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {activeFilterChips.length > 0 && (
              <span className="ml-2 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterChips.length}
              </span>
            )}
          </Button>
        </div>

        {/* Applied filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilterChips.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-xs font-medium"
              >
                {key === "propertyType" ? `Type: ${value}` : `Sort: ${value}`}
                <button onClick={() => removeFilter(key as keyof FavoriteFilters)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              className="text-xs text-gray-500 underline hover:text-gray-700"
              onClick={() => setAppliedFilters(null)}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Favorites Grid */}
      <FavoriteGrid
        onStatsChange={handleStatsChange}
        searchQuery={debouncedSearch}
        filter={appliedFilters?.propertyType || "all"}
        sortBy={appliedFilters?.sortBy || "recent"}
      />

      <FavoriteFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </DashboardLayout>
  );
}