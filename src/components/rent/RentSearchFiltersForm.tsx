"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  RentKind,
  RentSearchFilters,
  RADIUS_OPTIONS,
  RENT_PRICE_OPTIONS,
  RENT_MAX_PRICE_OPTIONS,
  SHORT_STAY_PRICE_OPTIONS,
  SHORT_STAY_MAX_PRICE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  BED_OPTIONS,
  MAX_BED_OPTIONS,
  ADDED_OPTIONS,
  filtersToSearchParams,
  rentBasePath,
  rentLabel,
} from "@/lib/rentSearch";

interface RentSearchFiltersFormProps {
  initial: RentSearchFilters;
  kind: RentKind;
}

const selectClass =
  "w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-slate-900 text-sm outline-none focus:border-slate-500 cursor-pointer";

export default function RentSearchFiltersForm({
  initial,
  kind,
}: RentSearchFiltersFormProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<RentSearchFilters>(initial);
  const base = rentBasePath(kind);

  const isShort = kind === "short-rent";
  const minPriceOpts = isShort ? SHORT_STAY_PRICE_OPTIONS : RENT_PRICE_OPTIONS;
  const maxPriceOpts = isShort
    ? SHORT_STAY_MAX_PRICE_OPTIONS
    : RENT_MAX_PRICE_OPTIONS;

  const update = (patch: Partial<RentSearchFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filters.location.trim()) return;
    const params = filtersToSearchParams(filters);
    router.push(`${base}/results?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f3f3f5] rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
        Find {rentLabel(kind).toLowerCase()}
        {filters.location ? ` in ${filters.location}` : ""}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Search radius
          </label>
          <select
            className={selectClass}
            value={filters.radius}
            onChange={(e) => update({ radius: e.target.value })}
          >
            {RADIUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Property types
          </label>
          <select
            className={selectClass}
            value={filters.propertyType}
            onChange={(e) => update({ propertyType: e.target.value })}
          >
            {PROPERTY_TYPE_OPTIONS.map((o) => (
              <option key={o.value || "any"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Added to site
          </label>
          <select
            className={selectClass}
            value={filters.addedToSite}
            onChange={(e) => update({ addedToSite: e.target.value })}
          >
            {ADDED_OPTIONS.map((o) => (
              <option key={o.value || "anytime"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Price range {isShort ? "(per night)" : "(pcm)"}
          </label>
          <div className="flex items-center gap-2">
            <select
              className={selectClass}
              value={filters.minPrice}
              onChange={(e) => update({ minPrice: e.target.value })}
            >
              {minPriceOpts.map((o) => (
                <option key={`min-${o.value || "none"}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="text-slate-500 font-medium">-</span>
            <select
              className={selectClass}
              value={filters.maxPrice}
              onChange={(e) => update({ maxPrice: e.target.value })}
            >
              {maxPriceOpts.map((o) => (
                <option key={`max-${o.value || "none"}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            No. of bedrooms
          </label>
          <div className="flex items-center gap-2">
            <select
              className={selectClass}
              value={filters.minBeds}
              onChange={(e) => update({ minBeds: e.target.value })}
            >
              {BED_OPTIONS.map((o) => (
                <option key={`bmin-${o.value || "none"}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="text-slate-500 font-medium">-</span>
            <select
              className={selectClass}
              value={filters.maxBeds}
              onChange={(e) => update({ maxBeds: e.target.value })}
            >
              {MAX_BED_OPTIONS.map((o) => (
                <option key={`bmax-${o.value || "none"}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includeLetAgreed}
              onChange={(e) => update({ includeLetAgreed: e.target.checked })}
              className="rounded border-gray-300 cursor-pointer"
            />
            {isShort ? "Include booked dates" : "Include Let Agreed"}
          </label>
          <button
            type="submit"
            className="cursor-pointer w-full h-12 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-colors"
          >
            Search properties
          </button>
        </div>
      </div>
    </form>
  );
}
