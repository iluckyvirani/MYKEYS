"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BuyResultsFilterBar from "@/components/buy/BuyResultsFilterBar";
import BuyResultsToolbar, {
  BuyResultsBreadcrumbBar,
} from "@/components/buy/BuyResultsToolbar";
import BuyResultCard, {
  BuyResultCardProperty,
} from "@/components/buy/BuyResultCard";
import BuyResultsMap, {
  ResultsMapProperty,
} from "@/components/buy/BuyResultsMap";
import {
  BuySearchFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  looksLikePostcode,
} from "@/lib/buySearch";
import { api } from "@/lib/api";

function BuyResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<BuySearchFilters>(() =>
    filtersFromSearchParams(searchParams)
  );
  const [properties, setProperties] = useState<BuyResultCardProperty[]>([]);
  const [mapData, setMapData] = useState<ResultsMapProperty[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("highest");
  const [mapView, setMapView] = useState(false);

  useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams));
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
    if (!filters.location.trim()) {
      router.replace("/buy");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        listingType: "BUY",
        pageSize: "50",
        page: "1",
      });

      const loc = filters.location.trim();
      if (looksLikePostcode(loc)) params.set("zipCode", loc);
      else params.set("city", loc);

      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.minBeds) params.set("bedrooms", filters.minBeds);
      if (filters.propertyType) params.set("propertyType", filters.propertyType);

      const response = await api.get(`/properties?${params.toString()}`);

      if (response.data?.success && response.data.data?.items) {
        const items = response.data.data.items;

        let mapped: BuyResultCardProperty[] = items.map((property: any) => ({
          id: property.id,
          title: property.title,
          address: [property.address, property.city, property.zipCode]
            .filter(Boolean)
            .join(", "),
          price: `£${property.price?.toLocaleString() || "0"}`,
          propertyPrice: `£${(property.propertyPrice || property.price)?.toLocaleString() || "0"}`,
          beds: property.bedrooms || 0,
          baths: property.bathrooms || 0,
          propertyType: property.propertyType || "Property",
          imageUrl: property.images?.[0]?.url || "/api/placeholder/400/300",
          images: (property.images || [])
            .slice(0, 3)
            .map((img: any) => img.url)
            .filter(Boolean),
          description: property.description || "",
          isFeatured: property.isFeatured || property.isBoosted || false,
          imageCount: property.images?.length || 1,
        }));

        if (sortBy === "highest") {
          mapped = [...mapped].sort((a, b) => {
            const pa = parseFloat(a.propertyPrice.replace(/[^0-9.]/g, "")) || 0;
            const pb = parseFloat(b.propertyPrice.replace(/[^0-9.]/g, "")) || 0;
            return pb - pa;
          });
        } else if (sortBy === "lowest") {
          mapped = [...mapped].sort((a, b) => {
            const pa = parseFloat(a.propertyPrice.replace(/[^0-9.]/g, "")) || 0;
            const pb = parseFloat(b.propertyPrice.replace(/[^0-9.]/g, "")) || 0;
            return pa - pb;
          });
        }

        setProperties(mapped);
        setTotalCount(response.data.data.total || mapped.length);

        setMapData(
          items.map((property: any) => ({
            id: String(property.id),
            title: property.title,
            price: `£${(property.propertyPrice || property.price)?.toLocaleString() || "0"}`,
            latitude:
              typeof property.latitude === "number" ? property.latitude : null,
            longitude:
              typeof property.longitude === "number"
                ? property.longitude
                : null,
            address: [property.address, property.city]
              .filter(Boolean)
              .join(", "),
            imageUrl: property.images?.[0]?.url || "",
          }))
        );
      } else {
        setProperties([]);
        setMapData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching buy results:", error);
      setProperties([]);
      setMapData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, router, sortBy]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const applyFiltersToUrl = (next?: BuySearchFilters) => {
    const active = next || filters;
    setFilters(active);
    const params = filtersToSearchParams(active);
    router.push(`/buy/results?${params.toString()}`);
  };

  const listContent = loading ? (
    <div className="bg-white rounded-lg p-10 text-center text-slate-500 shadow-sm border border-gray-200">
      Loading properties…
    </div>
  ) : properties.length === 0 ? (
    <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-200">
      <p className="text-[#0f172a] font-semibold text-lg mb-2">
        No properties found
      </p>
      <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
        We couldn&apos;t find any homes for sale
        {filters.location ? ` in ${filters.location}` : ""}. Try another
        location, widen your filters, or browse rentals nearby.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/buy")}
          className="cursor-pointer px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          New search
        </button>
        <a
          href={`/rent/whole-property/search?location=${encodeURIComponent(filters.location || "London")}`}
          className="cursor-pointer px-4 py-2 rounded-md border border-green-600 text-green-700 font-bold hover:bg-green-50"
        >
          See rentals instead
        </a>
      </div>
    </div>
  ) : (
    <div className="space-y-5">
      {properties.map((property) => (
        <BuyResultCard key={property.id} property={property} />
      ))}
    </div>
  );

  return (
    <>
      <Navbar />
      {/*
        Rightmove ulta-L:
        1) Filters bar = 100% width (dark)
        2) White top strip (Properties For Sale)
        3) LEFT = gray + result cards | RIGHT = white + map
           (white top + white right = ulta L)
      */}
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        {/* 1) FILTERS — full 100% */}
        <BuyResultsFilterBar
          filters={filters}
          onChange={setFilters}
          onSearch={applyFiltersToUrl}
        />

        {/* 2) WHITE top of ulta-L */}
        <BuyResultsBreadcrumbBar location={filters.location} />

        {/* 3) LEFT results (gray) + RIGHT map (white) */}
        <div className="flex w-full items-stretch min-h-[75vh]">
          {/* LEFT — gray background, filters/results list */}
          <section className="flex-1 min-w-0 bg-[#f5f5f7]">
            <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-gray-200">
              <BuyResultsToolbar
                location={filters.location}
                totalCount={totalCount}
                loading={loading}
                sortBy={sortBy}
                onSortChange={setSortBy}
                mapView={mapView}
                onToggleMapView={() => setMapView((v) => !v)}
                compact
              />
            </div>

            <div className="px-4 sm:px-6 py-5 space-y-5">{listContent}</div>
          </section>

          {/* RIGHT — white map column (vertical part of ulta-L) */}
          <aside className="hidden lg:block w-[400px] shrink-0 bg-white border-l border-gray-200">
            <div className="sticky top-[128px] md:top-[136px] p-4 space-y-4">
              <BuyResultsMap
                properties={mapData}
                locationLabel={filters.location}
                tall={mapView}
                onShowMapView={() => setMapView(true)}
              />
              <a
                href={`/rent/whole-property/search?location=${encodeURIComponent(filters.location)}`}
                className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 cursor-pointer"
              >
                <span>
                  See properties to rent in {filters.location || "this area"}
                </span>
                <span aria-hidden>›</span>
              </a>
            </div>
          </aside>
        </div>

        {/* Mobile map */}
        <div className="lg:hidden bg-[#f5f5f7] px-4 pb-8 space-y-4">
          <BuyResultsMap
            properties={mapData}
            locationLabel={filters.location}
            onShowMapView={() => setMapView(true)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function BuyResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading results…</p>
        </div>
      }
    >
      <BuyResultsContent />
    </Suspense>
  );
}
