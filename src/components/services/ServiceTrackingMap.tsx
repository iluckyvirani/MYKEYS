"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from "@/lib/googleMaps";

type Point = { lat: number; lng: number };

export default function ServiceTrackingMap({
  provider,
  destination,
  height = 280,
}: {
  provider: Point | null;
  destination: Point | null;
  height?: number;
}) {
  const hasKey = hasGoogleMapsApiKey();
  const { isLoaded, loadError } = useJsApiLoader({
    id: "mykeys-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["geometry"],
  });
  const [routePath, setRoutePath] = useState<Point[]>([]);
  const lastRouteKey = useRef("");

  const center = provider || destination || { lat: 51.5074, lng: -0.1278 };

  const boundsPoints = useMemo(() => {
    return [provider, destination].filter(Boolean) as Point[];
  }, [provider, destination]);

  useEffect(() => {
    if (!isLoaded || !provider || !destination || !window.google?.maps?.DirectionsService) {
      setRoutePath([]);
      return;
    }
    const key = `${provider.lat.toFixed(4)},${provider.lng.toFixed(4)}-${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
    if (lastRouteKey.current === key) return;
    lastRouteKey.current = key;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: provider,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result?.routes[0]?.overview_path) {
          setRoutePath(
            result.routes[0].overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() }))
          );
        } else {
          setRoutePath([provider, destination]);
        }
      }
    );
  }, [isLoaded, provider, destination]);

  if (!hasKey || loadError) {
    return (
      <div
        className="rounded-xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center px-4"
        style={{ height }}
      >
        <MapPin className="w-7 h-7 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">Map unavailable</p>
        <p className="text-xs text-gray-500 mt-1">
          Live pins still update. Open Google Maps for turn-by-turn directions.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="rounded-xl border bg-gray-50 flex items-center justify-center text-sm text-gray-500"
        style={{ height }}
      >
        Loading map…
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={provider && destination ? 12 : 13}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => {
          if (boundsPoints.length < 2 || !window.google?.maps) return;
          const bounds = new google.maps.LatLngBounds();
          boundsPoints.forEach((p) => bounds.extend(p));
          map.fitBounds(bounds, 48);
        }}
      >
        {provider && (
          <Marker
            position={provider}
            label={{ text: "P", color: "white", fontWeight: "700" }}
            title="Professional"
          />
        )}
        {destination && (
          <Marker
            position={destination}
            label={{ text: "H", color: "white", fontWeight: "700" }}
            title="Job location"
          />
        )}
        {routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#16a34a",
              strokeOpacity: 0.9,
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export function googleMapsDirectionsUrl(origin: Point | null, destination: Point | null) {
  if (origin && destination) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  }
  if (destination) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  }
  return "https://www.google.com/maps";
}
