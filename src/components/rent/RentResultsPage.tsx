"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RentResultsFilterBar from "@/components/rent/RentResultsFilterBar";
import RentResultsToolbar, {
  RentResultsBreadcrumbBar,
} from "@/components/rent/RentResultsToolbar";
import BuyResultCard, {
  BuyResultCardProperty,
} from "@/components/buy/BuyResultCard";
import BuyResultsMap from "@/components/buy/BuyResultsMap";
import PropertyMapView, {
  MapProperty,
} from "@/components/property/PropertyMapView";
import {
  RentKind,
  RentSearchFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  looksLikePostcode,
  rentBasePath,
} from "@/lib/rentSearch";
import {
  formatListingActivity,
  formatListingAgentName,
  resolveListingAgentLogo,
} from "@/lib/listingCard";
import { sortResultListings } from "@/lib/resultsSort";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

function formatRentPrice(
  amount: number | undefined | null,
  kind: RentKind
) {
  if (kind === "short-rent") return `${formatCurrency(amount)} / night`;
  return `${formatCurrency(amount)} pcm`;
}

function formatWeeklyFromMonthly(amount: number) {
  const weekly = Math.round(amount * 12 / 52);
  return `${formatCurrency(weekly)} pw`;
}

function RentResultsContent({ kind }: { kind: RentKind }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = rentBasePath(kind);
  const [filters, setFilters] = useState<RentSearchFilters>(() =>
    filtersFromSearchParams(searchParams)
  );
  const [properties, setProperties] = useState<BuyResultCardProperty[]>([]);
  const [mapData, setMapData] = useState<MapProperty[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [mapView, setMapView] = useState(false);
  const [drawnAreaIds, setDrawnAreaIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams));
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
    if (!filters.location.trim()) {
      router.replace(base);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        listingType: "RENT",
        rentalType: kind === "short-rent" ? "SHORT_TERM" : "LONG_TERM",
        pageSize: "50",
        page: "1",
      });

      if (kind === "whole-property") params.set("occupancyType", "WHOLE_PROPERTY");
      if (kind === "room-to-rent") params.set("occupancyType", "ROOM");

      const loc = filters.location.trim();
      if (looksLikePostcode(loc)) params.set("zipCode", loc);
      else params.set("city", loc);

      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.minBeds) params.set("bedrooms", filters.minBeds);
      if (filters.maxBeds) params.set("maxBedrooms", filters.maxBeds);
      if (filters.propertyType) params.set("propertyType", filters.propertyType);
      if (filters.addedToSite) params.set("addedWithinDays", filters.addedToSite);
      if (filters.radius && filters.radius !== "0") {
        params.set("radiusMiles", filters.radius);
      }

      const response = await api.get(`/properties?${params.toString()}`);

      if (response.data?.success && response.data.data?.items) {
        const items = response.data.data.items;

        let mapped: BuyResultCardProperty[] = items.map((property: any) => {
          const rent = property.price ?? property.propertyPrice ?? 0;
          const activity = formatListingActivity({
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
            price: rent,
            originalPrice: property.originalPrice,
          });
          const owner = property.owner;

          return {
            id: property.id,
            title: property.title,
            address: [property.address, property.city, property.zipCode]
              .filter(Boolean)
              .join(", "),
            price: formatRentPrice(rent, kind),
            propertyPrice: formatRentPrice(rent, kind),
            priceSecondary:
              kind !== "short-rent" && rent > 0
                ? formatWeeklyFromMonthly(rent)
                : undefined,
            beds: property.bedrooms || 0,
            baths: property.bathrooms || 0,
            propertyType: property.propertyType || "Property",
            occupancyLabel:
              kind === "room-to-rent" || property.occupancyType === "ROOM"
                ? "Room to rent"
                : kind === "whole-property"
                ? "Whole property"
                : kind === "short-rent"
                ? "Short stay"
                : undefined,
            imageUrl: property.images?.[0]?.url || "/api/placeholder/400/300",
            images: (property.images || [])
              .map((img: any) => img.url)
              .filter(Boolean),
            description: property.description || "",
            isFeatured: property.isFeatured || property.isBoosted || false,
            imageCount: property.images?.length || 1,
            listingActivity: activity.phrase,
            isNewHome: activity.isNewHome,
            createdAt: property.createdAt || undefined,
            agentName: formatListingAgentName(owner),
            agentPhone: owner?.phone || undefined,
            agentLogoUrl: resolveListingAgentLogo(owner),
          };
        });

        mapped = sortResultListings(mapped, sortBy);

        setProperties(mapped);
        setTotalCount(response.data.data.total || mapped.length);

        setMapData(
          items.map((property: any) => ({
            id: String(property.id),
            title: property.title,
            price: formatRentPrice(
              property.price ?? property.propertyPrice,
              kind
            ),
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
            beds: property.bedrooms || 0,
            baths: property.bathrooms || 0,
            propertyType: property.propertyType || "Property",
            listingType: "RENT",
            priceType: kind === "short-rent" ? "NIGHTLY" : "MONTHLY",
          }))
        );
      } else {
        setProperties([]);
        setMapData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching rent results:", error);
      setProperties([]);
      setMapData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, router, sortBy, base, kind]);

  useEffect(() => {
    fetchProperties();
    setDrawnAreaIds(null);
  }, [fetchProperties]);

  const applyFiltersToUrl = (next?: RentSearchFilters) => {
    const active = next || filters;
    setFilters(active);
    const params = filtersToSearchParams(active);
    router.push(`${base}/results?${params.toString()}`);
  };

  const displayedProperties = drawnAreaIds
    ? properties.filter((p) => drawnAreaIds.has(String(p.id)))
    : properties;

  const listContent = loading ? (
    <div className="bg-white rounded-lg p-10 text-center text-slate-500 shadow-sm border border-gray-200">
      Loading properties…
    </div>
  ) : displayedProperties.length === 0 ? (
    <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-200">
      <p className="text-[#0f172a] font-semibold text-lg mb-2">
        {drawnAreaIds ? "No properties in drawn area" : "No properties found"}
      </p>
      <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
        {drawnAreaIds
          ? "Try drawing a larger area on the map, or clear the area filter."
          : `We couldn't find any ${kind === "short-rent" ? "short stays" : "rentals"}${filters.location ? ` in ${filters.location}` : ""}. Try another location or widen your filters.`}
      </p>
      {drawnAreaIds ? (
        <button
          type="button"
          onClick={() => setDrawnAreaIds(null)}
          className="cursor-pointer px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          Clear area filter
        </button>
      ) : (
        <button
          type="button"
          onClick={() => router.push(base)}
          className="cursor-pointer px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          New search
        </button>
      )}
    </div>
  ) : (
    <div className="space-y-5">
      {drawnAreaIds && (
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-slate-700 flex items-center justify-between gap-3">
          <span>
            <span className="font-semibold">{displayedProperties.length}</span>{" "}
            {displayedProperties.length === 1 ? "property" : "properties"} in
            drawn area
          </span>
          <button
            type="button"
            onClick={() => setDrawnAreaIds(null)}
            className="text-green-700 font-semibold hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}
      {displayedProperties.map((property) => (
        <BuyResultCard key={property.id} property={property} />
      ))}
    </div>
  );

  return (
    <>
      <Navbar />
      {mapView && (
        <div className="fixed inset-0 top-[72px] md:top-[80px] z-40 bg-white">
          <PropertyMapView
            properties={mapData}
            searchLocation={filters.location}
            onBackToList={(filteredIds) => {
              setMapView(false);
              if (filteredIds !== undefined) {
                setDrawnAreaIds(new Set(filteredIds));
              }
            }}
          />
        </div>
      )}
      <main
        className={`min-h-screen bg-white pt-[72px] md:pt-[80px] ${mapView ? "hidden" : ""}`}
      >
        <RentResultsFilterBar
          filters={filters}
          onChange={setFilters}
          onSearch={applyFiltersToUrl}
          kind={kind}
        />

        <RentResultsBreadcrumbBar
          location={filters.location}
          kind={kind}
          filters={filters}
        />

        <div className="flex w-full items-stretch min-h-[75vh]">
          <section className="flex-1 min-w-0 bg-[#f5f5f7]">
            <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-gray-200">
              <RentResultsToolbar
                location={filters.location}
                totalCount={drawnAreaIds ? displayedProperties.length : totalCount}
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

          <aside className="hidden lg:block w-[400px] shrink-0 bg-white border-l border-gray-200">
            <div className="sticky top-[128px] md:top-[136px] p-4 space-y-4">
              <BuyResultsMap
                properties={mapData}
                locationLabel={filters.location}
                onShowMapView={() => setMapView(true)}
              />
              <a
                href={`/buy/results?location=${encodeURIComponent(filters.location)}&city=${encodeURIComponent(filters.location)}`}
                className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 cursor-pointer"
              >
                <span>
                  See properties for sale in {filters.location || "this area"}
                </span>
                <span aria-hidden>›</span>
              </a>
            </div>
          </aside>
        </div>

        <div className="lg:hidden bg-[#f5f5f7] px-4 pb-8 space-y-4">
          <BuyResultsMap
            properties={mapData}
            locationLabel={filters.location}
            onShowMapView={() => setMapView(true)}
          />
        </div>
      </main>
      {!mapView && <Footer />}
    </>
  );
}

export default function RentResultsPage({ kind }: { kind: RentKind }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading results…</p>
        </div>
      }
    >
      <RentResultsContent kind={kind} />
    </Suspense>
  );
}
