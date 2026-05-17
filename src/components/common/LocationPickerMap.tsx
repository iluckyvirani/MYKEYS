"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader } from "lucide-react";

export interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface LocationPickerMapProps {
  onLocationSelect: (result: LocationResult) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyBU4bIxc3n70tDjXJ5bFTy665UOR1z3DZw";

function extractComponents(components: any[], lat: number, lng: number): LocationResult {
  let streetNumber = "",
    route = "",
    city = "",
    state = "",
    zipCode = "";

  for (const c of components) {
    if (c.types.includes("street_number")) streetNumber = c.long_name;
    if (c.types.includes("route")) route = c.long_name;
    if (
      c.types.includes("locality") ||
      c.types.includes("postal_town")
    )
      city = c.long_name;
    if (c.types.includes("administrative_area_level_1")) state = c.long_name;
    if (c.types.includes("postal_code")) zipCode = c.long_name;
  }

  const address = [streetNumber, route].filter(Boolean).join(" ");
  return { lat, lng, address, city, state, zipCode };
}

export default function LocationPickerMap({
  onLocationSelect,
  initialLat,
  initialLng,
  height = "256px",
}: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  // Load Google Maps script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const g = (window as any).google;
    if (g?.maps) {
      setLoaded(true);
      return;
    }

    const scriptId = "google-maps-picker-api";
    if (document.getElementById(scriptId)) {
      const poll = setInterval(() => {
        if ((window as any).google?.maps) {
          setLoaded(true);
          clearInterval(poll);
        }
      }, 150);
      return () => clearInterval(poll);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialise map once script is loaded
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const google = (window as any).google;
    const hasInitial = typeof initialLat === "number" && typeof initialLng === "number";
    const center = hasInitial
      ? { lat: initialLat!, lng: initialLng! }
      : { lat: 51.5074, lng: -0.1278 }; // London default

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: hasInitial ? 14 : 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    const marker = new google.maps.Marker({
      map,
      position: hasInitial ? center : undefined,
      draggable: true,
    });
    markerRef.current = marker;

    // Click on map
    map.addListener("click", (e: any) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition(e.latLng);
      reverseGeocode(google, lat, lng);
    });

    // Drag marker
    marker.addListener("dragend", (e: any) => {
      if (!e.latLng) return;
      reverseGeocode(google, e.latLng.lat(), e.latLng.lng());
    });

    // Places autocomplete on the search input
    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode"],
        fields: ["address_components", "geometry", "formatted_address", "name"],
      });

      // Prevent map from stealing pointer events while pac-container is open
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });
        const result = extractComponents(place.address_components || [], lat, lng);
        if (inputRef.current)
          inputRef.current.value = place.formatted_address || "";
        onLocationSelect(result);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  function reverseGeocode(google: any, lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          if (inputRef.current)
            inputRef.current.value = results[0].formatted_address;
          const result = extractComponents(
            results[0].address_components,
            lat,
            lng
          );
          onLocationSelect(result);
        } else {
          onLocationSelect({ lat, lng, address: "", city: "", state: "", zipCode: "" });
        }
      }
    );
  }

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for an address or postcode..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Map container */}
      <div className="relative rounded-[5px] border border-gray-200 overflow-hidden" style={{ height }}>
        {!loaded && (
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center z-10">
            <Loader className="w-5 h-5 text-green-600 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Loading map…</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <MapPin className="w-3 h-3 text-gray-400" />
        Search for a location or click the map to pin the property — latitude &amp; longitude will be filled automatically.
      </p>
    </div>
  );
}
