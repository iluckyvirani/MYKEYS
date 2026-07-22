"use client";

import Link from "next/link";
import { Bell, ChevronDown, ChevronRight, MapPin, Star } from "lucide-react";
import {
  RentKind,
  rentBasePath,
  rentResultsTitle,
} from "@/lib/rentSearch";

interface RentResultsToolbarProps {
  location: string;
  totalCount: number;
  loading?: boolean;
  sortBy: string;
  onSortChange: (value: string) => void;
  mapView: boolean;
  onToggleMapView: () => void;
  compact?: boolean;
}

export function RentResultsBreadcrumbBar({
  location,
  kind,
}: {
  location: string;
  kind: RentKind;
}) {
  const label = rentResultsTitle(kind, location);
  const searchHref = `${rentBasePath(kind)}/search?location=${encodeURIComponent(location || "")}`;

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#64748b]">
          <Link
            href={searchHref}
            className="inline-flex items-center gap-0.5 hover:text-[#0f172a] cursor-pointer"
          >
            {label}
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-[#0f172a] cursor-pointer"
          >
            <Star className="w-[15px] h-[15px]" strokeWidth={1.75} />
            Save Search
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 hover:text-[#0f172a] cursor-pointer"
          >
            <span className="relative inline-flex">
              <Bell className="w-[15px] h-[15px]" strokeWidth={1.75} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#e87722] border border-white" />
            </span>
            Create Alert
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RentResultsToolbar({
  totalCount,
  loading,
  sortBy,
  onSortChange,
  mapView,
  onToggleMapView,
  compact = false,
}: RentResultsToolbarProps) {
  const inner = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 className="text-[#0f172a] leading-none">
        <span className="text-[28px] sm:text-[32px] font-bold tracking-tight">
          {loading ? "…" : totalCount.toLocaleString()}
        </span>{" "}
        <span className="text-[16px] sm:text-[18px] font-normal">results</span>
      </h1>

      <div className="flex items-center gap-6 sm:gap-8">
        <div className="inline-flex items-center gap-1.5 text-[14px]">
          <span className="text-[#64748b]">Sort:</span>
          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-transparent pr-5 text-[#0f172a] font-bold cursor-pointer outline-none"
            >
              <option value="highest">Highest Price</option>
              <option value="lowest">Lowest Price</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#0f172a] absolute right-0 pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleMapView}
          className={`inline-flex items-center gap-1.5 text-[14px] font-bold cursor-pointer ${
            mapView ? "text-green-700" : "text-[#0f172a] hover:text-green-700"
          }`}
        >
          <MapPin className="w-4 h-4" strokeWidth={2} />
          {mapView ? "List view" : "Map view"}
        </button>
      </div>
    </div>
  );

  if (compact) return inner;

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-3.5">{inner}</div>
    </div>
  );
}
