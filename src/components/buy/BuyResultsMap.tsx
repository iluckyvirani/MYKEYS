"use client";

import { useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
} from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from "@/lib/googleMaps";
import { MapPricePin, MapPropertyPopup } from "@/components/property/MapPropertyCard";

export interface ResultsMapProperty {
  id: string;
  title: string;
  price: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  imageUrl: string;
  beds?: number;
  baths?: number;
  propertyType?: string;
  listingType?: string;
  priceType?: string;
}

interface BuyResultsMapProps {
  properties: ResultsMapProperty[];
  locationLabel?: string;
  tall?: boolean;
  onShowMapView?: () => void;
}

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

function NoMapKeyPanel({
  locationLabel,
  tall,
}: {
  locationLabel?: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${
        tall ? "h-full flex flex-col" : ""
      }`}
    >
      <div
        className={`${
          tall ? "flex-1 min-h-[360px]" : "h-[280px]"
        } relative bg-gray-50 border-b border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 px-6 text-center`}
      >
        <MapPin className="w-8 h-8 text-gray-400" />
        <p className="text-[15px] font-semibold text-[#0f172a]">No map key</p>
        <p className="text-sm text-gray-500 max-w-xs">
          Add{" "}
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          to show the map
          {locationLabel ? ` for ${locationLabel}` : ""}.
        </p>
      </div>
      <div className="p-3">
        <p className="text-xs text-slate-500 text-center">
          Approximate location
          {locationLabel ? ` · ${locationLabel}` : ""}
        </p>
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
    id: "mykeys-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["drawing", "geometry"],
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

  if (loadError) {
    return <NoMapKeyPanel locationLabel={locationLabel} tall={tall} />;
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${
        tall ? "h-full flex flex-col" : ""
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
            onClick={() => setSelectedId(null)}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: true,
              clickableIcons: false,
            }}
          >
            {withCoords.map((p) =>
              selectedId === p.id ? (
                <OverlayView
                  key={`card-${p.id}`}
                  position={{ lat: p.latitude as number, lng: p.longitude as number }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={() => ({ x: 0, y: 0 })}
                >
                  <MapPropertyPopup
                    property={{
                      id: p.id,
                      title: p.title,
                      price: p.price,
                      address: p.address,
                      beds: p.beds ?? 0,
                      baths: p.baths ?? 0,
                      propertyType: p.propertyType || "Property",
                      imageUrl: p.imageUrl,
                      listingType: p.listingType,
                      priceType: p.priceType,
                    }}
                    onClose={() => setSelectedId(null)}
                  />
                </OverlayView>
              ) : (
                <OverlayView
                  key={p.id}
                  position={{ lat: p.latitude as number, lng: p.longitude as number }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={() => ({ x: 0, y: 0 })}
                >
                  <MapPricePin
                    price={p.price}
                    onClick={() => setSelectedId(p.id)}
                  />
                </OverlayView>
              )
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
  if (!hasGoogleMapsApiKey()) {
    return (
      <NoMapKeyPanel
        locationLabel={props.locationLabel}
        tall={props.tall}
      />
    );
  }
  return <GoogleResultsMap {...props} />;
}
