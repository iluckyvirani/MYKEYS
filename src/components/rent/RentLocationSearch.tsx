"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RentKind, rentBasePath } from "@/lib/rentSearch";

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

interface RentLocationSearchProps {
  initialLocation?: string;
  kind?: RentKind;
}

export default function RentLocationSearch({
  initialLocation = "",
  kind = "whole-property",
}: RentLocationSearchProps) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const base = rentBasePath(kind);

  const filtered = location.trim()
    ? SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(location.trim().toLowerCase())
      )
    : SUGGESTIONS.slice(0, 7);

  const goSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`${base}/search?location=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-hidden bg-white pt-24 pb-14 border-b border-gray-100">
      <div className="relative z-10 w-full max-w-3xl px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0f3d36] mb-6">
          {kind === "room-to-rent"
            ? "Search rooms to rent"
            : kind === "short-rent"
              ? "Search short stays"
              : "Search properties to rent"}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
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
              <ul className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
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
            className="cursor-pointer shrink-0 px-8 py-3.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
