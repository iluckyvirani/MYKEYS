"use client";

import  { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
  DrawingManager,
  InfoWindow,
} from "@react-google-maps/api";
import { ChevronLeft, RotateCcw, Edit2, Save, Eye } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapProperty {
  id: string;
  title: string;
  price: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  beds: number;
  baths: number;
  propertyType: string;
  imageUrl: string;
  listingType: string;
  priceType: string;
  slug?: string;
}

interface PropertyMapViewProps {
  properties: MapProperty[];
  searchLocation?: string;
  onBackToList: (filteredIds?: string[]) => void;
}

type DrawMode = "freehand" | "polygon" | "rectangle";
type ViewState = "map" | "drawn" | "editing";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const MAP_LIBRARIES: ("drawing" | "geometry")[] = ["drawing", "geometry"];

// Warm earth-tone map style (same as reference)
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f5f0eb" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#b9d3c2" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fdfcdc" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#cfe2cc" }] },
  { featureType: "transit.station", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
];

const DEFAULT_CENTER = { lat: 51.515, lng: -0.035 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPriceCompact(priceStr: string): string {
  const n = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  if (!n) return priceStr;
  if (n >= 1_000_000)
    return `£${(n / 1_000_000) % 1 === 0 ? n / 1_000_000 : (n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `£${Math.round(n / 1_000)}k`;
  return priceStr;
}

// ─── SVG Icons (matching reference DrawIcon / ClearIcon pattern) ──────────────

function DrawIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function FreehandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17c3-3 6-5 9-3s6 3 9-1" />
    </svg>
  );
}

function PolygonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
    </svg>
  );
}

function RectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PropertyMapView({
  properties,
  searchLocation,
  onBackToList,
}: PropertyMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: MAP_API_KEY,
    libraries: MAP_LIBRARIES,
  });

  // Refs
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchRectRef = useRef<google.maps.Rectangle | null>(null);
  const drawnPolygonRef = useRef<google.maps.Polygon | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const livePolylineRef = useRef<google.maps.Polyline | null>(null);
  const freehandPathRef = useRef<google.maps.LatLng[]>([]);
  const isMouseDownRef = useRef(false);
  const mapListenersRef = useRef<google.maps.MapsEventListener[]>([]);

  // State
  const [view, setView] = useState<ViewState>("map");
  const [drawMode, setDrawMode] = useState<DrawMode>("polygon");
  const [isDrawing, setIsDrawing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [drawnPropertyIds, setDrawnPropertyIds] = useState<string[]>([]);
  const [searchBounds, setSearchBounds] = useState<{
    north: number; south: number; east: number; west: number;
  } | null>(null);

  // Properties with valid coordinates AND valid longitude range (-180 to 180)
  const validProperties = properties.filter(
    (p): p is MapProperty & { latitude: number; longitude: number } =>
      typeof p.latitude === "number" &&
      typeof p.longitude === "number" &&
      p.latitude >= -90 && p.latitude <= 90 &&
      p.longitude >= -180 && p.longitude <= 180
  );

  // In drawn/editing view show only the matched properties
  const displayedProperties =
    view === "drawn" || view === "editing"
      ? validProperties.filter((p) => drawnPropertyIds.includes(p.id))
      : validProperties;

  // ── Geocode searchLocation → center map + draw boundary rectangle ─────────
  useEffect(() => {
    if (!isLoaded || !searchLocation) return;

    // Remove any previous search rectangle
    searchRectRef.current?.setMap(null);
    searchRectRef.current = null;
    setSearchBounds(null);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const b = results[0].geometry.bounds ?? results[0].geometry.viewport;
        mapRef.current?.fitBounds(b);

        const bounds = {
          north: b.getNorthEast().lat(),
          east:  b.getNorthEast().lng(),
          south: b.getSouthWest().lat(),
          west:  b.getSouthWest().lng(),
        };
        setSearchBounds(bounds);

        // Draw imperatively so it always shows regardless of React render timing
        if (mapRef.current) {
          searchRectRef.current = new google.maps.Rectangle({
            bounds,
            map: mapRef.current,
            strokeColor: "#4F46E5",
            strokeOpacity: 0.9,
            strokeWeight: 2.5,
            fillColor: "#4F46E5",
            fillOpacity: 0.1,
            zIndex: 1,
          });
        }
      }
    });
  }, [isLoaded, searchLocation]);

  // Remove rectangle when user starts drawing
  useEffect(() => {
    if (isDrawing && searchRectRef.current) {
      searchRectRef.current.setVisible(false);
    } else if (!isDrawing && searchRectRef.current) {
      searchRectRef.current.setVisible(true);
    }
  }, [isDrawing]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // ── Clear all drawing artifacts ────────────────────────────────────────
  const clearAll = useCallback(() => {
    drawnPolygonRef.current?.setMap(null);
    drawnPolygonRef.current = null;
    livePolylineRef.current?.setMap(null);
    livePolylineRef.current = null;
    freehandPathRef.current = [];
    isMouseDownRef.current = false;
    mapListenersRef.current.forEach((l) => google.maps.event.removeListener(l));
    mapListenersRef.current = [];
    if (drawingManagerRef.current) drawingManagerRef.current.setDrawingMode(null);
    setDrawnPropertyIds([]);
    setIsDrawing(false);
  }, []);

  // ── Build final filled polygon and filter properties ───────────────────
  const finalizePath = useCallback(
    (path: google.maps.LatLng[]) => {
      livePolylineRef.current?.setMap(null);
      livePolylineRef.current = null;
      mapRef.current?.setOptions({ draggable: true, gestureHandling: "greedy" });

      if (path.length < 3) {
        setIsDrawing(false);
        return;
      }

      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: "#4F46E5",
        strokeWeight: 2,
        fillColor: "#4F46E5",
        fillOpacity: 0.15,
        clickable: false,
        editable: false,
        map: mapRef.current,
      });

      drawnPolygonRef.current = polygon;

      const inside = validProperties.filter((p) =>
        google.maps.geometry.poly.containsLocation(
          new google.maps.LatLng(p.latitude, p.longitude),
          polygon
        )
      );

      setDrawnPropertyIds(inside.map((p) => p.id));
      setIsDrawing(false);
      setView("drawn");
    },
    [validProperties]
  );

  // ── Freehand drawing via raw map mouse events ──────────────────────────
  const startFreehand = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setOptions({ draggable: false, gestureHandling: "none" });

    const polyline = new google.maps.Polyline({
      strokeColor: "#4F46E5",
      strokeWeight: 2,
      map,
    });
    livePolylineRef.current = polyline;
    freehandPathRef.current = [];

    const l1 = map.addListener("mousedown", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      isMouseDownRef.current = true;
      freehandPathRef.current = [e.latLng];
      polyline.setPath([e.latLng]);
    });

    const l2 = map.addListener("mousemove", (e: google.maps.MapMouseEvent) => {
      if (!isMouseDownRef.current || !e.latLng) return;
      freehandPathRef.current = [...freehandPathRef.current, e.latLng];
      polyline.setPath(freehandPathRef.current);
    });

    const l3 = map.addListener("mouseup", () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      mapListenersRef.current.forEach((l) => google.maps.event.removeListener(l));
      mapListenersRef.current = [];
      finalizePath(freehandPathRef.current);
    });

    mapListenersRef.current = [l1, l2, l3];
  }, [finalizePath]);

  // ── Start draw (same pattern as reference handleEnableDraw) ───────────
  const handleStartDraw = useCallback(
    (mode: DrawMode) => {
      if (drawnPolygonRef.current) {
        drawnPolygonRef.current.setMap(null);
        drawnPolygonRef.current = null;
      }
      clearAll();
      setDrawMode(mode);
      setIsDrawing(true);
      setShowModeSelector(false);
      setView("map");
      if (mode === "freehand") startFreehand();
    },
    [clearAll, startFreehand]
  );

  // ── DrawingManager polygon / rectangle complete ────────────────────────
  const handleOverlayComplete = useCallback(
    (e: google.maps.drawing.OverlayCompleteEvent) => {
      let path: google.maps.LatLng[] = [];

      if (e.type === google.maps.drawing.OverlayType.POLYGON) {
        path = (e.overlay as google.maps.Polygon).getPath().getArray();
        (e.overlay as google.maps.Polygon).setMap(null);
      } else if (e.type === google.maps.drawing.OverlayType.RECTANGLE) {
        const bounds = (e.overlay as google.maps.Rectangle).getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          path = [
            new google.maps.LatLng(ne.lat(), sw.lng()),
            ne,
            new google.maps.LatLng(sw.lat(), ne.lng()),
            sw,
          ];
        }
        (e.overlay as google.maps.Rectangle).setMap(null);
      }

      finalizePath(path);
    },
    [finalizePath]
  );

  // ── Clear area (same as reference handleClearArea) ─────────────────────
  const handleClearArea = useCallback(() => {
    clearAll();
    setView("map");
  }, [clearAll]);

  // ── Draw again ─────────────────────────────────────────────────────────
  const handleDrawAgain = useCallback(() => {
    handleStartDraw(drawMode);
  }, [handleStartDraw, drawMode]);

  // ── Edit mode — make polygon vertices draggable ────────────────────────
  const handleEdit = useCallback(() => {
    if (!drawnPolygonRef.current) return;
    const full = drawnPolygonRef.current.getPath().getArray();
    if (full.length > 20) {
      const step = Math.ceil(full.length / 20);
      drawnPolygonRef.current.setPath(full.filter((_, i) => i % step === 0));
    }
    drawnPolygonRef.current.setOptions({ editable: true });
    setView("editing");
  }, []);

  const handleDoneEditing = useCallback(() => {
    if (!drawnPolygonRef.current) return;
    drawnPolygonRef.current.setOptions({ editable: false });
    const polygon = drawnPolygonRef.current;
    const inside = validProperties.filter((p) =>
      google.maps.geometry.poly.containsLocation(
        new google.maps.LatLng(p.latitude, p.longitude),
        polygon
      )
    );
    setDrawnPropertyIds(inside.map((p) => p.id));
    setView("drawn");
  }, [validProperties]);

  // ── Save area to localStorage ──────────────────────────────────────────
  const handleSaveArea = useCallback(() => {
    if (!drawnPolygonRef.current) return;
    const path = drawnPolygonRef.current
      .getPath()
      .getArray()
      .map((p) => ({ lat: p.lat(), lng: p.lng() }));
    try {
      localStorage.setItem("mykeys_saved_area", JSON.stringify(path));
    } catch {}
    alert("Area saved!");
  }, []);

  // ── View properties — filter list and go back ──────────────────────────
  const handleViewProperties = useCallback(() => {
    onBackToList(drawnPropertyIds);
  }, [drawnPropertyIds, onBackToList]);

  // ── Loading / error states ─────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ background: "#f5f0eb" }} className="w-full h-150 flex items-center justify-center rounded-lg">
        <p className="text-red-500 text-sm">Failed to load Google Maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ background: "#f5f0eb" }} className="w-full h-150 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto mb-3" />
          <p style={{ color: "#523735" }} className="text-sm">Loading map…</p>
        </div>
      </div>
    );
  }

  const dmDrawingMode =
    isDrawing && drawMode !== "freehand"
      ? drawMode === "polygon"
        ? google.maps.drawing.OverlayType.POLYGON
        : google.maps.drawing.OverlayType.RECTANGLE
      : null;

  const showBottomBar = view === "drawn" || view === "editing";

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* ── Top Controls Bar ───────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">

        {/* ← List view */}
        <button
          onClick={() => onBackToList()}
          className="pointer-events-auto flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
          List view
        </button>

        {/* Count banner */}
        <div className="pointer-events-auto bg-white rounded-lg px-4 py-2 shadow-md text-sm font-semibold text-gray-700 border border-gray-200">
          {view === "drawn" || view === "editing" ? (
            <>{drawnPropertyIds.length} {drawnPropertyIds.length === 1 ? "property" : "properties"} in drawn area</>
          ) : (
            <>Showing {validProperties.length} of {properties.length} properties</>
          )}
        </div>

        {/* Draw + Clear controls (same as reference map-controls) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {(view === "drawn" || view === "editing") && (
            <button
              onClick={handleClearArea}
              className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ClearIcon />
              Clear area
            </button>
          )}
          <button
            onClick={() => { if (!isDrawing) setShowModeSelector((s) => !s); }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 shadow-md text-sm font-medium transition-colors border ${
              isDrawing
                ? "bg-indigo-600 text-white border-indigo-600 cursor-not-allowed"
                : showModeSelector
                ? "bg-gray-100 text-gray-900 border-gray-300"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <DrawIcon />
            Draw
          </button>
        </div>
      </div>

      {/* ── Draw Mode Selector dropdown ─────────────────────────────────── */}
      {showModeSelector && (
        <div className="absolute top-16 right-3 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-44">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Draw type</p>
          <div className="flex flex-col gap-1.5">
            {(
              [
                { mode: "freehand" as DrawMode, label: "Freehand", Icon: FreehandIcon },
                { mode: "polygon" as DrawMode, label: "Polygon", Icon: PolygonIcon },
                { mode: "rectangle" as DrawMode, label: "Rectangle", Icon: RectIcon },
              ] as const
            ).map(({ mode, label, Icon }) => (
              <button
                key={mode}
                onClick={() => handleStartDraw(mode)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Draw instructions (same as reference draw-hint) ─────────────── */}
      {isDrawing && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white rounded-full px-5 py-2.5 shadow-md border border-gray-200 text-sm font-medium text-gray-700 whitespace-nowrap">
          {drawMode === "freehand"
            ? "Hold and drag on the map to draw your area"
            : drawMode === "polygon"
            ? "Click to add points  •  Double-click to finish"
            : "Click and drag to draw a rectangle"}
        </div>
      )}

      {/* ── Google Map ──────────────────────────────────────────────────── */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={DEFAULT_CENTER}
        zoom={13}
        onLoad={onMapLoad}
        onClick={() => setSelectedProperty(null)}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        {/* Search area boundary is drawn imperatively via searchRectRef in geocode effect */}

        {/* DrawingManager for polygon / rectangle modes */}
        {isDrawing && drawMode !== "freehand" && (
          <DrawingManager
            onLoad={(dm: google.maps.drawing.DrawingManager) => {
              drawingManagerRef.current = dm;
            }}
            drawingMode={dmDrawingMode}
            onOverlayComplete={handleOverlayComplete}
            options={{
              drawingControl: false,
              polygonOptions: {
                strokeColor: "#4F46E5",
                strokeWeight: 2,
                fillColor: "#4F46E5",
                fillOpacity: 0.15,
                clickable: false,
              },
              rectangleOptions: {
                strokeColor: "#4F46E5",
                strokeWeight: 2,
                fillColor: "#4F46E5",
                fillOpacity: 0.15,
                clickable: false,
              },
            }}
          />
        )}

        {/* Price bubble OverlayViews (same as reference price-pin) */}
        {displayedProperties.map((property) => (
          <OverlayView
            key={property.id}
            position={{ lat: property.latitude, lng: property.longitude }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(w, h) => ({ x: -(w / 2), y: -(h / 2) })}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProperty(selectedProperty?.id === property.id ? null : property);
              }}
              style={{
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                userSelect: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                border: "2px solid",
                transition: "transform 0.1s",
                background: selectedProperty?.id === property.id ? "#4F46E5" : "#ffffff",
                color: selectedProperty?.id === property.id ? "#ffffff" : "#1a1a1a",
                borderColor: selectedProperty?.id === property.id ? "#4F46E5" : "#ffffff",
                transform: selectedProperty?.id === property.id ? "scale(1.1)" : "scale(1)",
              }}
            >
              {formatPriceCompact(property.price)}
            </div>
          </OverlayView>
        ))}

        {/* InfoWindow for selected property (same pattern as reference InfoWindow) */}
        {selectedProperty &&
          typeof selectedProperty.latitude === "number" &&
          typeof selectedProperty.longitude === "number" && (
            <InfoWindow
              position={{ lat: selectedProperty.latitude, lng: selectedProperty.longitude }}
              onCloseClick={() => setSelectedProperty(null)}
            >
              {/* InfoWindow renders into Google Maps DOM — use inline styles */}
              <div style={{ width: "210px", fontFamily: "system-ui, sans-serif" }}>
                <img
                  src={
                    selectedProperty.imageUrl ||
                    "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=400"
                  }
                  alt={selectedProperty.title}
                  style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", display: "block" }}
                />
                <div style={{ padding: "0 2px" }}>
                  <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 3px" }}>
                    {selectedProperty.price}
                  </p>
                  <p style={{ fontWeight: 600, fontSize: "12px", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1a1a1a" }}>
                    {selectedProperty.title}
                  </p>
                  <p style={{ fontSize: "11px", color: "#666", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedProperty.address}
                  </p>
                  <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#444", marginBottom: "10px" }}>
                    <span>🛏 {selectedProperty.beds}</span>
                    <span>🛁 {selectedProperty.baths}</span>
                    <span style={{ textTransform: "capitalize" }}>
                      {selectedProperty.propertyType?.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </div>
                  <a
                    href={`/property/${selectedProperty.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", textAlign: "center", background: "#4F46E5", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "7px 12px", borderRadius: "6px", textDecoration: "none" }}
                  >
                    View Property
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
      </GoogleMap>

      {/* ── Bad coordinates warning ──────────────────────────────────────── */}
      {properties.length > 0 && validProperties.length < properties.length && view === "map" && (
        <div className="absolute bottom-6 left-3 z-20 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-2.5 text-xs font-medium shadow-md max-w-xs">
          ⚠ {properties.length - validProperties.length} of {properties.length} properties
          are missing valid coordinates and won't appear on the map.
          Please update their latitude/longitude in the database.
        </div>
      )}

      {/* ── Draw results banner (same as reference draw-results-banner) ─── */}
      {(view === "drawn" || view === "editing") && drawnPropertyIds.length > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-white rounded-full px-5 py-2 shadow-md text-sm font-semibold whitespace-nowrap pointer-events-none">
          {drawnPropertyIds.length} {drawnPropertyIds.length === 1 ? "property" : "properties"} in drawn area
        </div>
      )}

      {/* ── Bottom Action Bar ────────────────────────────────────────────── */}
      {showBottomBar && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white rounded-full shadow-2xl border border-gray-200 px-2 py-1.5 flex items-center gap-1">
            <button onClick={handleDrawAgain} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Draw again
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            {view === "drawn" ? (
              <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <Edit2 className="w-4 h-4" />
                Edit area
              </button>
            ) : (
              <button onClick={handleDoneEditing} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <Edit2 className="w-4 h-4" />
                Done editing
              </button>
            )}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={handleSaveArea} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <Save className="w-4 h-4" />
              Save area
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={handleViewProperties} className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              <Eye className="w-4 h-4" />
              View properties
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
