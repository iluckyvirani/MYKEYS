"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from "@/lib/googleMaps";

const MAP_API_KEY = GOOGLE_MAPS_API_KEY;
const hasMapKey = hasGoogleMapsApiKey();

type Props = {
  latitude: number;
  longitude: number;
  title?: string;
  addressLabel?: string;
};

function NoMapKeyMessage({ addressLabel }: { addressLabel?: string }) {
  return (
    <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-3">
      {addressLabel ? (
        <h2 className="text-[18px] font-bold text-[#0f172a]">{addressLabel}</h2>
      ) : null}
      <div className="h-[220px] w-full rounded-[4px] border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <MapPin className="w-8 h-8 text-gray-400" />
        <p className="text-[15px] font-semibold text-[#0f172a]">No map key</p>
        <p className="text-sm text-gray-500 max-w-sm">
          Google Maps is unavailable. Add{" "}
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          to enable the location map.
        </p>
      </div>
    </div>
  );
}

function GooglePropertyMap({ latitude, longitude, title, addressLabel }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "mykeys-google-maps",
    googleMapsApiKey: MAP_API_KEY,
    libraries: ["drawing", "geometry"],
  });

  const center = { lat: latitude, lng: longitude };
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;

  if (loadError) {
    return (
      <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-3">
        {addressLabel ? (
          <h2 className="text-[18px] font-bold text-[#0f172a]">{addressLabel}</h2>
        ) : null}
        <div className="h-[220px] w-full rounded-[4px] border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <MapPin className="w-8 h-8 text-gray-400" />
          <p className="text-[15px] font-semibold text-[#0f172a]">Map failed to load</p>
          <p className="text-sm text-gray-500">
            Check that your Google Maps API key is valid and Maps JavaScript API is enabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-3">
      {addressLabel ? (
        <h2 className="text-[18px] font-bold text-[#0f172a]">{addressLabel}</h2>
      ) : null}
      <div className="relative h-[300px] w-full rounded-[4px] overflow-hidden border border-gray-200 bg-gray-100">
        <div className="absolute top-3 left-3 bg-white/95 border border-gray-200 rounded px-3 py-1 text-xs font-bold text-[#0f172a] z-[1] shadow-sm">
          Approximate location
        </div>
        {!isLoaded ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Loading map…
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={15}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            <Marker position={center} title={title} />
          </GoogleMap>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1] flex gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-bold text-[#0f172a] shadow-sm hover:bg-gray-50"
          >
            Open map
          </a>
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-bold text-[#0f172a] shadow-sm hover:bg-gray-50"
          >
            Street View
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PropertyLocationMap(props: Props) {
  if (!hasMapKey) {
    return <NoMapKeyMessage addressLabel={props.addressLabel} />;
  }
  return <GooglePropertyMap {...props} />;
}
