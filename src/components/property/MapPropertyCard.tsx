"use client";

import type { CSSProperties } from "react";
import { BedDouble, Bath, Building2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type MapCardProperty = {
  id: string;
  title: string;
  price: string;
  address: string;
  beds: number;
  baths: number;
  propertyType: string;
  imageUrl: string;
  listingType?: string;
  priceType?: string;
};

export function formatMapPriceCompact(priceStr: string): string {
  const n = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  if (!n) return priceStr;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `£${m % 1 === 0 ? m : m.toFixed(1)}m`;
  }
  if (n >= 1_000) return `£${Math.round(n / 1_000)}k`;
  return priceStr.startsWith("£") ? priceStr : `£${priceStr}`;
}

function listingLabel(listingType?: string, priceType?: string) {
  const listing = (listingType || "").toUpperCase();
  const price = (priceType || "").toUpperCase();
  if (listing === "BUY") return "For sale";
  if (price === "NIGHTLY") return "Short stay";
  if (price === "MONTHLY") return "To rent";
  if (listing === "RENT") return "To rent";
  return "";
}

function typeLabel(propertyType?: string) {
  return (propertyType || "Property").toLowerCase().replace(/_/g, " ");
}

const overlayAnchor: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  transform: "translate(-50%, -100%)",
  zIndex: 2,
};

export function MapPricePin({
  price,
  selected,
  onClick,
}: {
  price: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div style={overlayAnchor}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "max-content",
          minWidth: 48,
          padding: "5px 10px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          cursor: "pointer",
          border: selected ? "2px solid #3db2ad" : "1px solid #e5e7eb",
          background: selected ? "#3db2ad" : "#ffffff",
          color: selected ? "#ffffff" : "#111827",
          boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
        }}
      >
        {formatMapPriceCompact(price)}
      </button>
    </div>
  );
}

export function MapPropertyPopup({
  property,
  onClose,
}: {
  property: MapCardProperty;
  onClose: () => void;
}) {
  const badge = listingLabel(property.listingType, property.priceType);

  return (
    <div
      style={{ ...overlayAnchor, zIndex: 20, width: 276, paddingBottom: 10 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          boxShadow: "0 12px 32px rgba(15,23,42,0.22)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ position: "relative" }}>
          <img
            src={
              property.imageUrl ||
              "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=400"
            }
            alt={property.title}
            style={{
              width: "100%",
              height: 132,
              objectFit: "cover",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 28,
              height: 28,
              borderRadius: 999,
              border: "none",
              background: "rgba(255,255,255,0.95)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} color="#374151" />
          </button>
          {badge && (
            <span
              style={{
                position: "absolute",
                left: 8,
                top: 8,
                background: "#111827",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 999,
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <div style={{ padding: "12px 14px 14px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            {formatCurrency(property.price)}
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {property.title}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "#6b7280",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {property.address}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 10,
              fontSize: 12,
              color: "#374151",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <BedDouble size={14} color="#339390" />
              {property.beds} bed{property.beds === 1 ? "" : "s"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Bath size={14} color="#339390" />
              {property.baths} bath{property.baths === 1 ? "" : "s"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, textTransform: "capitalize" }}>
              <Building2 size={14} color="#339390" />
              {typeLabel(property.propertyType)}
            </span>
          </div>

          <a
            href={`/property/${property.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              marginTop: 12,
              textAlign: "center",
              background: "#3db2ad",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              padding: "9px 12px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            View Property
          </a>
        </div>
      </div>
      <div
        style={{
          width: 12,
          height: 12,
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
          transform: "rotate(45deg)",
          margin: "-7px auto 0",
        }}
      />
    </div>
  );
}
