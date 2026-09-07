"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import {
  RentKind,
  rentBasePath,
  rentResultsTitle,
  type RentSearchFilters,
} from "@/lib/rentSearch";
import { RESULTS_SORT_OPTIONS } from "@/lib/resultsSort";
import SaveSearchAlertActions from "@/components/search/SaveSearchAlertActions";

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
  filters,
}: {
  location: string;
  kind: RentKind;
  filters: RentSearchFilters;
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
          <SaveSearchAlertActions
            location={location}
            listingType="RENT"
            rentalType={kind === "short-rent" ? "SHORT_TERM" : "LONG_TERM"}
            filters={{ ...filters, kind }}
          />
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
              {RESULTS_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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
