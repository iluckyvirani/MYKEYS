"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader, Info, AlertTriangle, LocateFixed } from "lucide-react";
import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from "@/lib/googleMaps";
import { formatUkPostcode, isLikelyUkPostcode } from "@/lib/ukPostcode";

export interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
}

interface LocationPickerMapProps {
  onLocationSelect: (result: LocationResult) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
  compact?: boolean;
  placeholder?: string;
}

function extractComponents(
  components: google.maps.GeocoderAddressComponent[],
  lat: number,
  lng: number,
  formattedAddress = ""
): LocationResult {
  let streetNumber = "",
    route = "",
    city = "",
    state = "",
    zipCode = "";

  for (const c of components) {
    if (c.types.includes("street_number")) streetNumber = c.long_name;
    if (c.types.includes("route")) route = c.long_name;
    if (c.types.includes("locality") || c.types.includes("postal_town"))
      city = c.long_name;
    if (c.types.includes("administrative_area_level_1")) state = c.long_name;
    if (c.types.includes("postal_code")) zipCode = c.long_name;
  }

  const address = [streetNumber, route].filter(Boolean).join(" ");
  const postcode = zipCode
    ? isLikelyUkPostcode(zipCode)
      ? formatUkPostcode(zipCode)
      : zipCode
    : "";
  return {
    lat,
    lng,
    address,
    city,
    state,
    zipCode: postcode,
    formattedAddress:
      formattedAddress || [address, city, postcode].filter(Boolean).join(", "),
  };
}

declare global {
  interface Window {
    google?: typeof google;
  }
}

export default function LocationPickerMap({
  onLocationSelect,
  initialLat,
  initialLng,
  height = "256px",
  compact = false,
  placeholder = "Search for an address or postcode...",
}: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onSelectRef = useRef(onLocationSelect);
  const reverseGeocodeRef = useRef<(lat: number, lng: number) => void>(() => undefined);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    onSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Load Google Maps script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!hasGoogleMapsApiKey()) {
      setLoadError(
        "Google Maps API key is missing or invalid. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env and restart the server."
      );
      return;
    }

    if (window.google?.maps) {
      setLoaded(true);
      return;
    }

    const scriptId = "google-maps-picker-api";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      const poll = setInterval(() => {
        if (window.google?.maps) {
          setLoaded(true);
          clearInterval(poll);
        }
      }, 150);
      const timeout = setTimeout(() => {
        clearInterval(poll);
        if (!window.google?.maps) {
          setLoadError(
            "Google Maps failed to load. Check the browser console (ApiNotActivatedMapError, InvalidKeyMapError, or RefererNotAllowedMapError)."
          );
        }
      }, 12000);
      return () => {
        clearInterval(poll);
        clearTimeout(timeout);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    script.onerror = () =>
      setLoadError(
        "Could not load the Google Maps script. Check your API key, billing, and network."
      );
    document.head.appendChild(script);
  }, []);

  // Initialise map once script is loaded
  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google?.maps) return;

    const g = window.google;
    const hasInitial =
      typeof initialLat === "number" && typeof initialLng === "number";
    const center = hasInitial
      ? { lat: initialLat!, lng: initialLng! }
      : { lat: 51.5074, lng: -0.1278 };

    const map = new g.maps.Map(mapRef.current, {
      center,
      zoom: hasInitial ? 14 : 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    const marker = new g.maps.Marker({
      map,
      position: hasInitial ? center : undefined,
      draggable: true,
    });
    markerRef.current = marker;

    const reverseGeocode = (lat: number, lng: number) => {
      const geocoder = new g.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          if (inputRef.current) {
            inputRef.current.value = results[0].formatted_address;
          }
          onSelectRef.current(
            extractComponents(
              results[0].address_components,
              lat,
              lng,
              results[0].formatted_address
            )
          );
        } else {
          onSelectRef.current({
            lat,
            lng,
            address: "",
            city: "",
            state: "",
            zipCode: "",
            formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          });
        }
      });
    };

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition(e.latLng);
      reverseGeocode(lat, lng);
    });
    reverseGeocodeRef.current = reverseGeocode;

    marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    });

    if (inputRef.current && g.maps.places) {
      const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode"],
        fields: ["address_components", "geometry", "formatted_address", "name"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });
        const result = extractComponents(
          place.address_components || [],
          lat,
          lng,
          place.formatted_address || ""
        );
        if (inputRef.current) {
          inputRef.current.value = place.formatted_address || "";
        }
        onSelectRef.current(result);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("This browser cannot detect your location.");
      return;
    }
    setGeoError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapInstanceRef.current?.setCenter({ lat, lng });
        mapInstanceRef.current?.setZoom(16);
        markerRef.current?.setPosition({ lat, lng });
        reverseGeocodeRef.current(lat, lng);
        setLocating(false);
      },
      () => {
        setGeoError("Could not detect location. Allow access and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  if (loadError) {
    return (
      <div className="rounded-[5px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold">Map unavailable</p>
            <p>{loadError}</p>
            <ul className="list-disc pl-4 text-amber-900 space-y-1">
              <li>
                Enable <strong>Maps JavaScript API</strong>,{" "}
                <strong>Places API</strong>, and <strong>Geocoding API</strong>
              </li>
              <li>Attach billing to the Google Cloud project</li>
              <li>
                Key restrictions (HTTP referrers): allow this site{" "}
                <code className="text-xs">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/*`
                    : "https://mykeysuk.com/*"}
                </code>
                {", "}
                <code className="text-xs">https://mykeysuk.com/*</code>
                {", "}
                <code className="text-xs">https://www.mykeysuk.com/*</code>
                {", and "}
                <code className="text-xs">http://localhost:3000/*</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex gap-3 rounded-[5px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <Info className="w-5 h-5 shrink-0 text-green-600 mt-0.5" aria-hidden />
          <div>
            <p className="font-medium">Pick your property on the map</p>
            <p className="mt-1 text-green-800 leading-relaxed">
              Search for an address or postcode, click anywhere on the map, or
              drag the pin. We&apos;ll auto-fill your street address, city,
              region, postcode, and coordinates — you can edit any field
              afterwards.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className={`w-full pl-9 pr-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              compact ? "rounded-xl h-11" : "rounded-[5px]"
            }`}
          />
        </div>
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={locating || !loaded}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 border text-sm font-medium cursor-pointer disabled:opacity-60 ${
            compact
              ? "rounded-xl h-11 border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
              : "rounded-[5px] border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {locating ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{locating ? "Finding…" : "My location"}</span>
        </button>
      </div>
      {geoError && <p className="text-xs text-red-600">{geoError}</p>}

      <div
        className={`relative border border-gray-200 overflow-hidden ${
          compact ? "rounded-xl" : "rounded-[5px]"
        }`}
        style={{ height }}
      >
        {!loaded && (
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center z-10">
            <Loader className="w-5 h-5 text-green-600 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Loading map…</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <p className="text-xs text-gray-500 flex items-start gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
        <span>
          {compact
            ? "Search, tap the map, drag the pin, or use My location."
            : "Tip: Use the search box or tap the map — your address details below will update automatically."}
        </span>
      </p>
    </div>
  );
}
