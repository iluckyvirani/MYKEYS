"use client";

import { useState } from "react";
import { X, SlidersHorizontal, Check } from "lucide-react";
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
  DEFAULT_RENT_SEARCH_FILTERS,
} from "@/lib/rentSearch";

interface RentResultsFilterBarProps {
  filters: RentSearchFilters;
  onChange: (next: RentSearchFilters) => void;
  onSearch: (next?: RentSearchFilters) => void;
  kind?: RentKind;
}

/** Signature Rightmove Cyan/Teal chevron arrow for top filter dropdowns */
function CyanChevron() {
  return (
    <svg
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      aria-hidden
      className="shrink-0 ml-1.5 transition-transform duration-150"
    >
      <path
        d="M1.5 1.5L5.5 5.5L9.5 1.5"
        stroke="#3db2ad"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Dark Chevron for white search box radius dropdown */
function DarkChevron() {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      aria-hidden
      className="shrink-0 ml-2"
    >
      <path
        d="M1.5 1.5L6 5.5L10.5 1.5"
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterLabel({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const selected = options.find((o) => o.value === value);
  const label = selected?.label || placeholder;

  return (
    <label className="relative inline-flex items-center cursor-pointer group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[#333]"
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={`${placeholder}-${o.value}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="inline-flex items-center text-[15px] font-bold text-white leading-none whitespace-nowrap pointer-events-none group-hover:text-white/90">
        {label}
        <CyanChevron />
      </span>
    </label>
  );
}

function Divider() {
  return (
    <span
      className="hidden md:block w-px h-[22px] bg-white/25 shrink-0 mx-2 lg:mx-3"
      aria-hidden
    />
  );
}

export default function RentResultsFilterBar({
  filters,
  onChange,
  onSearch,
  kind = "whole-property",
}: RentResultsFilterBarProps) {
  const [showModal, setShowModal] = useState(false);
  const isShort = kind === "short-rent";
  const minPriceOpts = (
    isShort ? SHORT_STAY_PRICE_OPTIONS : RENT_PRICE_OPTIONS
  ).filter((o) => o.value);
  const maxPriceOpts = (
    isShort ? SHORT_STAY_MAX_PRICE_OPTIONS : RENT_MAX_PRICE_OPTIONS
  ).filter((o) => o.value);

  const patchAndSearch = (patch: Partial<RentSearchFilters>) => {
    const next = { ...filters, ...patch };
    onChange(next);
    onSearch(next);
  };

  const radiusLabel =
    RADIUS_OPTIONS.find((o) => o.value === filters.radius)?.label ||
    "This area only";

  return (
    <div className="w-full bg-slate-900 border-b border-black/20 sticky top-[72px] md:top-[80px] z-40 shadow-md">
      <div className="max-w-[1400px] mx-auto flex items-center h-[56px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full min-w-0 overflow-x-auto no-scrollbar gap-2 lg:gap-4">
          {/* Combined location + radius — pure white rounded box like Rightmove */}
          <div className="flex items-center h-[40px] bg-white rounded-[8px] shrink-0 overflow-hidden shadow-sm">
            <div className="relative flex items-center w-[160px] sm:w-[220px] md:w-[260px] lg:w-[280px] h-full">
              <input
                value={filters.location}
                onChange={(e) =>
                  onChange({ ...filters, location: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch({ ...filters, location: filters.location });
                  }
                }}
                className="w-full h-full pl-4 pr-8 text-[15px] font-normal text-[#1a1a1a] outline-none bg-transparent placeholder:text-gray-400"
                placeholder="Location"
              />
              {filters.location && (
                <button
                  type="button"
                  aria-label="Clear"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1a1a1a] hover:text-black cursor-pointer p-0.5"
                  onClick={() => patchAndSearch({ location: "" })}
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              )}
            </div>

            <span className="w-px h-full bg-[#e2e8f0] shrink-0" aria-hidden />

            <label className="relative flex items-center min-w-[140px] sm:min-w-[150px] px-3.5 h-full cursor-pointer">
              <select
                value={filters.radius}
                onChange={(e) => patchAndSearch({ radius: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[#333]"
                aria-label="Search radius"
              >
                {RADIUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="inline-flex items-center justify-between w-full text-[15px] font-medium text-[#1a1a1a] leading-none pointer-events-none">
                <span className="whitespace-nowrap font-normal">{radiusLabel}</span>
                <DarkChevron />
              </span>
            </label>
          </div>

          <Divider />

          {/* Price Range */}
          <div className="flex items-center gap-3 shrink-0">
            <FilterLabel
              value={filters.minPrice}
              onChange={(v) => patchAndSearch({ minPrice: v })}
              options={minPriceOpts}
              placeholder="Min Price"
            />
            <span className="text-[14px] font-normal text-white/90 leading-none px-0.5">
              to
            </span>
            <FilterLabel
              value={filters.maxPrice}
              onChange={(v) => patchAndSearch({ maxPrice: v })}
              options={maxPriceOpts}
              placeholder="Max Price"
            />
          </div>

          <Divider />

          {/* Bedrooms Range */}
          <div className="flex items-center gap-3 shrink-0">
            <FilterLabel
              value={filters.minBeds}
              onChange={(v) => patchAndSearch({ minBeds: v })}
              options={BED_OPTIONS.filter((o) => o.value !== "")}
              placeholder="Min Beds"
            />
            <span className="text-[14px] font-normal text-white/90 leading-none px-0.5">
              to
            </span>
            <FilterLabel
              value={filters.maxBeds}
              onChange={(v) => patchAndSearch({ maxBeds: v })}
              options={MAX_BED_OPTIONS.filter((o) => o.value)}
              placeholder="Max Beds"
            />
          </div>

          <Divider />

          {/* Property Type */}
          <div className="shrink-0">
            <FilterLabel
              value={filters.propertyType}
              onChange={(v) => patchAndSearch({ propertyType: v })}
              options={PROPERTY_TYPE_OPTIONS.filter((o) => o.value)}
              placeholder="Property Type"
            />
          </div>

          <Divider />

          {/* Filters Button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center text-[15px] font-bold text-white cursor-pointer shrink-0 leading-none hover:text-white/90"
            >
              Filters
              <CyanChevron />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters Drawer / Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#3db2ad]" />
                All Filters
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Added to site
                </label>
                <select
                  value={filters.addedToSite}
                  onChange={(e) =>
                    onChange({ ...filters, addedToSite: e.target.value })
                  }
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#3db2ad]"
                >
                  {ADDED_OPTIONS.map((o) => (
                    <option key={o.value || "anytime"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.includeLetAgreed}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        includeLetAgreed: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-[#3db2ad] focus:ring-[#3db2ad] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Include Let Agreed
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-5 mt-6">
              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...DEFAULT_RENT_SEARCH_FILTERS,
                    location: filters.location,
                  });
                }}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Reset filters
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    onSearch(filters);
                  }}
                  className="px-5 py-2 text-sm font-bold text-white bg-[#0f172a] hover:bg-[#1e293b] rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#3db2ad]" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

