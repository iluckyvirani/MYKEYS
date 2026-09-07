"use client";

import { useState } from "react";
import {
  BedDouble,
  Bath,
  Maximize2,
  Home,
  Info,
  ChevronDown,
} from "lucide-react";
import {
  FURNISH_LABELS,
  GARDEN_LABELS,
  PARKING_LABELS,
  formatUkDate,
  formatWeeklyFromMonthly,
  labelOrAsk,
  type PropertyUtilities,
} from "@/lib/propertyDetails";
import { formatCurrency } from "@/lib/utils";

export type PropertyListingDetailsData = {
  title: string;
  address: string;
  city: string;
  state: string;
  description: string;
  listingType: string;
  rentalType: string | null;
  occupancyType?: string | null;
  priceLabel: string;
  pricePerMonth?: number;
  pricePerNight?: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  tenure: string;
  listingActivity: string;
  isNewHome: boolean;
  availableFrom?: string | Date | null;
  securityDeposit?: number | null;
  furnishType?: string | null;
  councilTaxBand?: string | null;
  billsIncluded?: boolean | null;
  minTerm?: number | null;
  maxTerm?: number | null;
  parkingType?: string | null;
  parking?: boolean;
  garden?: string | null;
  accessibility?: string | null;
  epcRating?: string | null;
  epcCurrentScore?: number | null;
  epcPotentialScore?: number | null;
  keyFeatures?: string[];
  amenities?: string[];
  utilities?: PropertyUtilities | null;
  broadbandSpeed?: string | null;
  floodRisk?: string | null;
  /** Short stay */
  guests?: number | null;
  minStay?: number | null;
  maxStay?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  selfCheckIn?: boolean | null;
  cleaningFee?: number | null;
  serviceFee?: number | null;
  agentName?: string;
  latitude?: number | null;
  longitude?: number | null;
};

function Ask({ value }: { value?: string | null }) {
  return <span className="font-bold text-[#0f172a]">{value || "Ask agent"}</span>;
}

function Accordion({
  title,
  icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="bg-white rounded-[4px] border border-gray-200 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50"
      >
        <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">{children}</div>
      )}
    </div>
  );
}

function epcBandFromScore(score?: number | null, letter?: string | null) {
  if (letter) return letter.toUpperCase();
  if (score == null) return null;
  if (score >= 92) return "A";
  if (score >= 81) return "B";
  if (score >= 69) return "C";
  if (score >= 55) return "D";
  if (score >= 39) return "E";
  if (score >= 21) return "F";
  return "G";
}

export default function PropertyListingDetails({
  property,
}: {
  property: PropertyListingDetailsData;
}) {
  const isRent = property.listingType === "RENT";
  const isLongRent = isRent && property.rentalType === "LONG_TERM";
  const isShortStay = isRent && property.rentalType === "SHORT_TERM";
  const isBuy = property.listingType === "BUY";
  const isRoom = isLongRent && property.occupancyType === "ROOM";

  const features =
    property.keyFeatures?.length
      ? property.keyFeatures
      : (property.amenities || []).slice(0, 12);

  const utils = property.utilities || {};
  const parkingLabel = property.parkingType
    ? labelOrAsk(property.parkingType, PARKING_LABELS)
    : property.parking
    ? "Available"
    : "Ask agent";

  const band = epcBandFromScore(property.epcCurrentScore, property.epcRating);
  const currentScore = property.epcCurrentScore;
  const potentialScore = property.epcPotentialScore ?? property.epcCurrentScore;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-[22px] font-bold text-[#0f172a] leading-snug">
            {property.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-baseline gap-2 mb-3">
          <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">
            {property.priceLabel}
          </span>
          {isLongRent && property.pricePerMonth ? (
            <span className="text-[15px] text-gray-500 font-medium">
              {formatWeeklyFromMonthly(property.pricePerMonth)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-[13.5px] border-b border-gray-100 pb-4 mb-4">
          <span className="font-semibold text-[#339390]">
            {isLongRent ? "Tenancy info" : isBuy ? "Sale details" : "Stay details"}
          </span>
          <span className="text-gray-500">
            {property.listingActivity}
            {property.isNewHome ? " · New home" : ""}
          </span>
        </div>

        {isLongRent && (
          <div className="mb-5 space-y-3">
            <h2 className="text-[18px] font-bold text-[#0f172a]">Letting details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-[14px]">
              <div>
                Let type:{" "}
                <Ask value={isRoom ? "Room to rent" : "Whole property"} />
              </div>
              <div>
                Let available date:{" "}
                <Ask
                  value={
                    property.availableFrom
                      ? formatUkDate(property.availableFrom)
                      : null
                  }
                />
              </div>
              <div>
                Deposit:{" "}
                <Ask
                  value={
                    property.securityDeposit
                      ? `£${property.securityDeposit.toLocaleString()}`
                      : null
                  }
                />
              </div>
              <div>
                Furnish type:{" "}
                <Ask
                  value={
                    property.furnishType
                      ? FURNISH_LABELS[property.furnishType] || property.furnishType
                      : null
                  }
                />
              </div>
              <div>
                Council Tax:{" "}
                <Ask
                  value={
                    property.councilTaxBand
                      ? `Band ${property.councilTaxBand}`
                      : null
                  }
                />
              </div>
              <div>
                Bills included:{" "}
                <Ask
                  value={
                    property.billsIncluded == null
                      ? null
                      : property.billsIncluded
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
              <div>
                Min term:{" "}
                <Ask
                  value={
                    property.minTerm
                      ? `${property.minTerm} month${property.minTerm === 1 ? "" : "s"}`
                      : null
                  }
                />
              </div>
              <div>
                Max term:{" "}
                <Ask
                  value={
                    property.maxTerm
                      ? `${property.maxTerm} month${property.maxTerm === 1 ? "" : "s"}`
                      : null
                  }
                />
              </div>
            </div>
          </div>
        )}

        {isShortStay && (
          <div className="mb-5 space-y-3">
            <h2 className="text-[18px] font-bold text-[#0f172a]">Stay details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-[14px]">
              <div>
                Price:{" "}
                <Ask
                  value={
                    property.pricePerNight
                      ? `${formatCurrency(property.pricePerNight)} / night`
                      : property.priceLabel
                  }
                />
              </div>
              <div>
                Guests: <Ask value={property.guests ? String(property.guests) : null} />
              </div>
              <div>
                Min stay:{" "}
                <Ask
                  value={
                    property.minStay
                      ? `${property.minStay} night${property.minStay === 1 ? "" : "s"}`
                      : null
                  }
                />
              </div>
              <div>
                Max stay:{" "}
                <Ask
                  value={
                    property.maxStay
                      ? `${property.maxStay} night${property.maxStay === 1 ? "" : "s"}`
                      : null
                  }
                />
              </div>
              <div>
                Check-in: <Ask value={property.checkInTime || null} />
              </div>
              <div>
                Check-out: <Ask value={property.checkOutTime || null} />
              </div>
              <div>
                Self check-in:{" "}
                <Ask
                  value={
                    property.selfCheckIn == null
                      ? null
                      : property.selfCheckIn
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
              <div>
                Cleaning fee:{" "}
                <Ask
                  value={
                    property.cleaningFee
                      ? `£${property.cleaningFee.toLocaleString()}`
                      : null
                  }
                />
              </div>
              <div>
                Service fee:{" "}
                <Ask
                  value={
                    property.serviceFee
                      ? `£${property.serviceFee.toLocaleString()}`
                      : null
                  }
                />
              </div>
              <div>
                Security deposit:{" "}
                <Ask
                  value={
                    property.securityDeposit
                      ? `£${property.securityDeposit.toLocaleString()}`
                      : null
                  }
                />
              </div>
            </div>
          </div>
        )}

        {isBuy && (
          <div className="mb-5 space-y-3">
            <h2 className="text-[18px] font-bold text-[#0f172a]">Sale details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-[14px]">
              <div>
                Tenure: <Ask value={property.tenure || null} />
              </div>
              <div>
                Council Tax:{" "}
                <Ask
                  value={
                    property.councilTaxBand
                      ? `Band ${property.councilTaxBand}`
                      : null
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 pt-1 border-t border-gray-100">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
              PROPERTY TYPE
            </span>
            <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5 capitalize">
              <Home className="w-4 h-4 text-gray-600 shrink-0" />
              {property.propertyType.toLowerCase()}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
              BEDROOMS
            </span>
            <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-gray-600 shrink-0" />
              {property.beds || "—"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
              BATHROOMS
            </span>
            <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-gray-600 shrink-0" />
              {property.baths || "—"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
              SIZE
            </span>
            <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-gray-600 shrink-0" />
              {property.sqft ? `${property.sqft} sq ft` : "Ask agent"}
            </span>
            {property.sqft > 0 && (
              <span className="text-[11px] text-gray-500 block ml-[22px]">
                {Math.round(property.sqft * 0.092903)} sq m
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key features */}
      <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
        <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">Key features</h2>
        {features.length ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-[14px] text-[#0f172a]">
            {features.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0f172a] shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Ask agent for full features.</p>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
        <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">Description</h2>
        <p className="text-[14px] text-[#334155] leading-relaxed whitespace-pre-line">
          {property.description || "No description provided."}
        </p>
      </div>

      {/* Attribute strip */}
      <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13.5px]">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
              COUNCIL TAX <Info className="w-3 h-3 text-gray-400" />
            </span>
            <Ask
              value={
                property.councilTaxBand ? `Band: ${property.councilTaxBand}` : null
              }
            />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              PARKING
            </span>
            <Ask value={parkingLabel === "Ask agent" ? null : parkingLabel} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              GARDEN
            </span>
            <Ask
              value={
                property.garden
                  ? GARDEN_LABELS[property.garden] || property.garden
                  : null
              }
            />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              ACCESSIBILITY
            </span>
            <Ask value={property.accessibility} />
          </div>
        </div>
      </div>

      {/* EPC */}
      <Accordion title="Energy Performance Certificate" defaultOpen={!!band}>
        {band ? (
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="text-sm space-y-2">
              <p className="font-bold text-[#0f172a]">
                Energy efficiency rating: Band {band}
              </p>
              {currentScore != null && (
                <p className="text-gray-600">
                  Current score: <strong>{currentScore}</strong>
                  {potentialScore != null && (
                    <>
                      {" "}
                      · Potential: <strong>{potentialScore}</strong>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">EPC details not provided — ask agent.</p>
        )}
      </Accordion>

      {/* Utilities */}
      <Accordion title="Utilities, rights & restrictions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-[14px]">
          <div>
            <p className="font-bold text-[#0f172a] mb-3">Utility supply</p>
            <div className="space-y-2.5">
              {(
                [
                  ["electricity", "Electric"],
                  ["water", "Water"],
                  ["heating", "Heating"],
                  ["broadband", "Broadband"],
                  ["sewerage", "Sewerage"],
                ] as const
              ).map(([k, label]) => (
                <div
                  key={k}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 items-baseline"
                >
                  <span className="text-[#334155]">{label}</span>
                  <Ask value={utils[k]} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-bold text-[#0f172a] mb-3">Rights and restrictions</p>
            <div className="space-y-2.5">
              {(
                [
                  ["privateRightOfWay", "Private rights of way"],
                  ["publicRightOfWay", "Public rights of way"],
                  ["listedProperty", "Listed property"],
                  ["restrictions", "Restrictions"],
                ] as const
              ).map(([k, label]) => (
                <div
                  key={k}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 items-baseline"
                >
                  <span className="text-[#334155]">{label}</span>
                  <Ask value={utils[k]} />
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4">
            <p className="font-bold text-[#0f172a] mb-3">Risks</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <div className="space-y-2.5">
                {(
                  [
                    ["floodedLast5Years", "Flooded in last 5 years"],
                    ["floodDefenses", "Flood defenses"],
                    ["floodSource", "Source of flood"],
                  ] as const
                ).map(([k, label]) => (
                  <div
                    key={k}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 items-baseline"
                  >
                    <span className="text-[#334155]">{label}</span>
                    <Ask
                      value={
                        utils[k] ||
                        (k === "floodSource" ? property.floodRisk : null)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      {/* Broadband */}
      <Accordion title="Broadband speed" defaultOpen={!!property.broadbandSpeed}>
        {property.broadbandSpeed ? (
          <div>
            <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
              Broadband speeds available
            </p>
            <p className="text-[28px] font-extrabold text-[#0f172a] mt-1">
              {property.broadbandSpeed}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              As provided by the listing owner — confirm with the provider.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Ask agent for broadband availability.</p>
        )}
      </Accordion>

      <p className="text-[12px] text-gray-500 leading-relaxed px-1">
        Disclaimer — The information displayed about this property comprises a property
        advertisement. MYKEYS makes no warranty as to the accuracy or completeness of the
        advertisement. Please contact {property.agentName || "the listing agent"} directly
        to obtain any information which may be available under the terms of The Energy
        Performance of Buildings Regulations.
      </p>
    </div>
  );
}
