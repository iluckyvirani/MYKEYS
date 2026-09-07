"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  FURNISH_TYPE_OPTIONS,
  GARDEN_OPTIONS,
  PARKING_TYPE_OPTIONS,
  EMPTY_UTILITIES,
  type PropertyUtilities,
} from "@/lib/propertyDetails";

export type PropertyUkExtraValues = {
  furnishType: string;
  garden: string;
  parkingType: string;
  accessibility: string;
  epcCurrentScore: string;
  epcPotentialScore: string;
  keyFeaturesText: string;
  broadbandSpeed: string;
  floodRisk: string;
  utilities: PropertyUtilities;
};

export const DEFAULT_UK_EXTRA: PropertyUkExtraValues = {
  furnishType: "",
  garden: "",
  parkingType: "",
  accessibility: "",
  epcCurrentScore: "",
  epcPotentialScore: "",
  keyFeaturesText: "",
  broadbandSpeed: "",
  floodRisk: "",
  utilities: { ...EMPTY_UTILITIES },
};

interface Props {
  values: PropertyUkExtraValues;
  onChange: (patch: Partial<PropertyUkExtraValues>) => void;
  onUtilityChange: (key: keyof PropertyUtilities, value: string) => void;
  showLettingFields?: boolean;
}

const selectClass =
  "w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white";

export default function PropertyUkExtraFields({
  values,
  onChange,
  onUtilityChange,
  showLettingFields = true,
}: Props) {
  return (
    <div className="space-y-6 border rounded-[5px] p-5 bg-white">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Property details (listing page)
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          These fields power the public property details page (letting info, EPC, utilities).
        </p>
      </div>

      {showLettingFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Furnish type</Label>
            <select
              className={`${selectClass} mt-1.5`}
              value={values.furnishType}
              onChange={(e) => onChange({ furnishType: e.target.value })}
            >
              {FURNISH_TYPE_OPTIONS.map((o) => (
                <option key={o.value || "any"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Garden</Label>
            <select
              className={`${selectClass} mt-1.5`}
              value={values.garden}
              onChange={(e) => onChange({ garden: e.target.value })}
            >
              {GARDEN_OPTIONS.map((o) => (
                <option key={o.value || "any"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Parking type</Label>
            <select
              className={`${selectClass} mt-1.5`}
              value={values.parkingType}
              onChange={(e) => onChange({ parkingType: e.target.value })}
            >
              {PARKING_TYPE_OPTIONS.map((o) => (
                <option key={o.value || "any"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Accessibility</Label>
            <Input
              className="mt-1.5"
              value={values.accessibility}
              onChange={(e) => onChange({ accessibility: e.target.value })}
              placeholder="e.g. Step-free access, lift"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>EPC current score (1–100)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            className="mt-1.5"
            value={values.epcCurrentScore}
            onChange={(e) => onChange({ epcCurrentScore: e.target.value })}
            placeholder="e.g. 84"
          />
        </div>
        <div>
          <Label>EPC potential score (1–100)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            className="mt-1.5"
            value={values.epcPotentialScore}
            onChange={(e) => onChange({ epcPotentialScore: e.target.value })}
            placeholder="e.g. 84"
          />
        </div>
      </div>

      <div>
        <Label>Key features (one per line)</Label>
        <textarea
          className={`${selectClass} mt-1.5 min-h-[120px]`}
          value={values.keyFeaturesText}
          onChange={(e) => onChange({ keyFeaturesText: e.target.value })}
          placeholder={"Floor to ceiling windows\nFully equipped gym\n24-hour concierge"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Broadband speed</Label>
          <Input
            className="mt-1.5"
            value={values.broadbandSpeed}
            onChange={(e) => onChange({ broadbandSpeed: e.target.value })}
            placeholder="e.g. Ultrafast 5000Mb"
          />
        </div>
        <div>
          <Label>Flood risk summary</Label>
          <Input
            className="mt-1.5"
            value={values.floodRisk}
            onChange={(e) => onChange({ floodRisk: e.target.value })}
            placeholder="e.g. Very low"
          />
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          Utilities, rights &amp; risks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(
            [
              ["electricity", "Electric"],
              ["water", "Water"],
              ["heating", "Heating"],
              ["broadband", "Broadband"],
              ["sewerage", "Sewerage"],
              ["privateRightOfWay", "Private rights of way"],
              ["publicRightOfWay", "Public rights of way"],
              ["listedProperty", "Listed property"],
              ["restrictions", "Restrictions"],
              ["floodedLast5Years", "Flooded in last 5 years"],
              ["floodDefenses", "Flood defenses"],
              ["floodSource", "Source of flood"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label className="shrink-0 w-40">{label}</Label>
              <Input
                value={values.utilities[key] || ""}
                onChange={(e) => onUtilityChange(key, e.target.value)}
                placeholder="Ask agent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
