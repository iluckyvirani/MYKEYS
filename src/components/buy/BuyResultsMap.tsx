"use client";

import { useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import Link from "next/link";
import { Info, MapPin } from "lucide-react";

export interface ResultsMapProperty {
  id: string;
  title: string;
  price: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  imageUrl: string;
}

interface BuyResultsMapProps {
  properties: ResultsMapProperty[];
  locationLabel?: string;
  tall?: boolean;
  onShowMapView?: () => void;
}

const MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const hasRealKey =
  Boolean(MAP_API_KEY) &&
  !MAP_API_KEY.includes("your-google") &&
  MAP_API_KEY.length > 20;

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

function MapPreviewPanel({
  locationLabel,
  onShowMapView,
  tall,
}: {
  locationLabel?: string;
  onShowMapView?: () => void;
  tall?: boolean;
}) {
  const q = encodeURIComponent(locationLabel || "United Kingdom");

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${
        tall ? "h-full flex flex-col" : "sticky top-20"
      }`}
    >
      <div
        className={`${
          tall ? "flex-1 min-h-[360px]" : "h-[280px]"
        } relative bg-[#e8eef5]`}
      >
        <iframe
          title="Location map"
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${q}&z=11&output=embed`}
        />
        <div className="absolute top-3 left-3 right-3 flex justify-center pointer-events-none">
          <div className="bg-white border border-sky-200 rounded-md shadow px-3 py-2.5 max-w-[260px] pointer-events-auto">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Map preview</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  Approximate area for {locationLabel || "your search"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 bg-white border-t border-transparent">
        {/* Inset divider like Rightmove — not full 100% card width */}
        <div className="mx-3 mb-3 border-t border-gray-200" />
        {onShowMapView ? (
          <button
            type="button"
            onClick={onShowMapView}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-md text-slate-800 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[#0f172a]" />
            Show results on map
          </button>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            Approximate location
            {locationLabel ? ` · ${locationLabel}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function GoogleResultsMap({
  properties,
  locationLabel,
  tall,
  onShowMapView,
}: BuyResultsMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "mykeys-buy-results-map",
    googleMapsApiKey: MAP_API_KEY,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const withCoords = useMemo(
    () =>
      properties.filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
      ),
    [properties]
  );

  const center = useMemo(() => {
    if (withCoords.length === 0) return DEFAULT_CENTER;
    const lat =
      withCoords.reduce((s, p) => s + (p.latitude as number), 0) /
      withCoords.length;
    const lng =
      withCoords.reduce((s, p) => s + (p.longitude as number), 0) /
      withCoords.length;
    return { lat, lng };
  }, [withCoords]);

  const selected = withCoords.find((p) => p.id === selectedId);

  if (loadError) {
    return (
      <MapPreviewPanel
        locationLabel={locationLabel}
        onShowMapView={onShowMapView}
        tall={tall}
      />
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${
        tall ? "h-full flex flex-col" : "sticky top-20"
      }`}
    >
      <div
        className={`${
          tall ? "flex-1 min-h-[360px]" : "h-[320px]"
        } w-full bg-gray-100`}
      >
        {!isLoaded ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            Loading map…
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={withCoords.length ? 11 : 10}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: true,
            }}
          >
            {withCoords.map((p) => (
              <Marker
                key={p.id}
                position={{
                  lat: p.latitude as number,
                  lng: p.longitude as number,
                }}
                onClick={() => setSelectedId(p.id)}
              />
            ))}
            {selected && (
              <InfoWindow
                position={{
                  lat: selected.latitude as number,
                  lng: selected.longitude as number,
                }}
                onCloseClick={() => setSelectedId(null)}
              >
                <div className="max-w-[180px]">
                  <img
                    src={selected.imageUrl}
                    alt=""
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="font-bold text-sm text-slate-900">
                    {selected.price}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {selected.address}
                  </p>
                  <Link
                    href={`/property/${selected.id}`}
                    className="text-xs text-green-700 font-semibold mt-1 inline-block cursor-pointer"
                  >
                    View
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
      <div className="p-3 border-t border-gray-100 space-y-2">
        <p className="text-xs text-slate-500">
          {locationLabel
            ? `Approximate location · ${locationLabel}`
            : "Approximate location"}
        </p>
        {onShowMapView && (
          <button
            type="button"
            onClick={onShowMapView}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md border border-gray-300 bg-white text-slate-800 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-green-600" />
            Show results on map
          </button>
        )}
      </div>
    </div>
  );
}

export default function BuyResultsMap(props: BuyResultsMapProps) {
  if (!hasRealKey) {
    return (
      <MapPreviewPanel
        locationLabel={props.locationLabel}
        onShowMapView={props.onShowMapView}
        tall={props.tall}
      />
    );
  }
  return <GoogleResultsMap {...props} />;
}
