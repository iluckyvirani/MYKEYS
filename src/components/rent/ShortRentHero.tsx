"use client";

import { Search } from "lucide-react";
import { useState } from "react";

const SUGGESTIONS = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Bristol",
  "Edinburgh",
  "Glasgow",
  "Cardiff",
  "Liverpool",
  "SW1A 1AA",
];

interface ShortRentHeroProps {
  onSearchChange?: (city: string, zipCode: string) => void;
  initialCity?: string;
  initialZipCode?: string;
}

const looksLikePostcode = (value: string) => /\d/.test(value);

export default function ShortRentHero({
  onSearchChange,
  initialCity = "",
  initialZipCode = "",
}: ShortRentHeroProps) {
  const [location, setLocation] = useState(initialZipCode || initialCity);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = location.trim()
    ? SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(location.trim().toLowerCase())
      )
    : SUGGESTIONS.slice(0, 7);

  const goSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !onSearchChange) return;
    const isPostcode = looksLikePostcode(trimmed);
    onSearchChange(isPostcode ? "" : trimmed, isPostcode ? trimmed : "");
    setTimeout(() => {
      document
        .getElementById("property-grid-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  return (
    <section className="relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-visible bg-white pt-24 pb-28 border-b border-gray-100 z-20">
      <div className="relative z-30 w-full max-w-3xl px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0f3d36] mb-6">
          Search short stays
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="relative flex-1 w-full">
            <div className="flex items-center bg-white rounded-lg border-2 border-green-500 focus-within:border-green-600 overflow-hidden shadow-sm">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && goSearch(location)}
                placeholder="e.g. London, Manchester or SW1A 1AA"
                className="w-full px-3 py-3.5 text-slate-900 outline-none text-base"
              />
            </div>

            {showSuggestions && filtered.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-2 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                {filtered.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 text-slate-800 hover:bg-gray-50 cursor-pointer font-medium"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setLocation(item);
                        goSearch(item);
                      }}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => goSearch(location)}
            className="cursor-pointer shrink-0 w-full sm:w-auto px-8 py-3.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
