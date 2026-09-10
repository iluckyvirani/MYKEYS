"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Navigation, Radio } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ServiceTrackingMap, { googleMapsDirectionsUrl } from "./ServiceTrackingMap";

type TrackingSnapshot = {
  bookingId: string;
  status: string;
  trackingActive: boolean;
  location: string | null;
  destination: { lat: number; lng: number } | null;
  provider: { lat: number; lng: number; updatedAt: string } | null;
  providerName: string;
};

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 15_000) return "just now";
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} min ago`;
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ServiceLiveTrackPanel({
  bookingId,
  role,
  shareLocation = false,
  compact = false,
}: {
  bookingId: string;
  role: "provider" | "client";
  shareLocation?: boolean;
  compact?: boolean;
}) {
  const [snap, setSnap] = useState<TrackingSnapshot | null>(null);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const watchRef = useRef<number | null>(null);
  const lastSent = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/service/bookings/${bookingId}/tracking`);
      const data = res.data?.data as TrackingSnapshot;
      setSnap(data);
      setError("");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not load live location"
      );
    }
  }, [bookingId]);

  const sendPing = useCallback(
    async (lat: number, lng: number, action: "start" | "ping" = "ping") => {
      const res = await api.post(`/service/bookings/${bookingId}/tracking`, {
        action,
        lat,
        lng,
      });
      setSnap(res.data?.data as TrackingSnapshot);
    },
    [bookingId]
  );

  useEffect(() => {
    load();
    const poll = setInterval(load, role === "client" ? 6000 : 12000);
    return () => clearInterval(poll);
  }, [load, role]);

  useEffect(() => {
    if (role !== "provider" || !shareLocation) return;
    if (!navigator.geolocation) {
      setError("This device cannot share live location");
      return;
    }

    const onPos = (pos: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastSent.current < 8000) return;
      lastSent.current = now;
      sendPing(pos.coords.latitude, pos.coords.longitude, "ping").catch(() => undefined);
    };

    setSharing(true);
    watchRef.current = navigator.geolocation.watchPosition(onPos, (geoErr) => {
      setError(
        geoErr.code === geoErr.PERMISSION_DENIED
          ? "Allow location access so the client can see you coming"
          : "Could not read your GPS location"
      );
      setSharing(false);
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });

    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      setSharing(false);
    };
  }, [role, shareLocation, sendPing]);

  const mapsUrl = googleMapsDirectionsUrl(snap?.provider ?? null, snap?.destination ?? null);
  const live = Boolean(snap?.trackingActive && snap.provider);

  return (
    <div className={`rounded-xl border ${live ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"} p-3 space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Radio className={`w-4 h-4 ${live ? "text-green-600 animate-pulse" : "text-gray-400"}`} />
            {role === "provider"
              ? live
                ? "Sharing live location"
                : "Live direction"
              : live
                ? `${snap?.providerName || "Professional"} is on the way`
                : "Waiting for live location"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {snap?.provider?.updatedAt
              ? `Updated ${timeAgo(snap.provider.updatedAt)}`
              : snap?.location || "Job address will appear once tracking starts"}
          </p>
        </div>
        {sharing && <Loader2 className="w-4 h-4 animate-spin text-green-600 shrink-0" />}
      </div>

      {error && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">{error}</p>}

      <ServiceTrackingMap
        provider={snap?.provider ?? null}
        destination={snap?.destination ?? null}
        height={compact ? 220 : 280}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          asChild
        >
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Navigation className="w-3.5 h-3.5 mr-1.5" />
            {role === "provider" ? "Open Google Maps directions" : "Open in Google Maps"}
            <ExternalLink className="w-3 h-3 ml-1.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
