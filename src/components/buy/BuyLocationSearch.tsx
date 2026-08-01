"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

interface BuyLocationSearchProps {
  initialLocation?: string;
  title?: string;
  placeholder?: string;
  buttonLabel?: string;
}

export default function BuyLocationSearch({
  initialLocation = "",
  title = "Search properties to buy",
  placeholder = "e.g. London, Manchester or SW1A 1AA",
  buttonLabel = "Search",
}: BuyLocationSearchProps) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#buy-search") {
      document
        .getElementById("buy-search")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const filtered = location.trim()
    ? SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(location.trim().toLowerCase())
      )
    : SUGGESTIONS.slice(0, 7);

  const goSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/buy/search?location=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section
      id="buy-search"
      className="relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-visible bg-white pt-24 pb-28 border-b border-gray-100 scroll-mt-20 z-20"
    >
      <div className="relative z-30 w-full max-w-3xl px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0f3d36] mb-6">
          {title}
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
                placeholder={placeholder}
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
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
