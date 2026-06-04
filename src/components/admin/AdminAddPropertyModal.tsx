"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Search,
  User,
  Building,
  MapPin,
  Home,
  Hotel,
  Calendar,
  TrendingUp,
  Bed,
  Bath,
  Maximize2,
  Upload,
  PoundSterling,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader,
  AlertCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import LocationPickerMap, { LocationResult } from "@/components/common/LocationPickerMap";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface EligibleOwner {
  id: string;
  name: string;
  email: string;
  packageName: string;
  propertyCount: number;
}

interface AdminAddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const propertyTypes = [
  "APARTMENT",
  "VILLA",
  "HOUSE",
  "STUDIO",
  "PENTHOUSE",
  "COTTAGE",
  "BUNGALOW",
  "COMMERCIAL",
];

const initialForm = {
  title: "",
  description: "",
  propertyType: "",
  address: "",
  city: "",
  state: "",
  country: "United Kingdom",
  zipCode: "",
  latitude: "",
  longitude: "",
  // Pricing
  price: "",
  priceType: "NIGHTLY",
  securityDeposit: "",
  cleaningFee: "",
  serviceFee: "",
  propertyPrice: "",
  // Details
  beds: "",
  baths: "",
  sqft: "",
  guests: "2",
  minStay: "1",
  maxStay: "30",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  yearBuilt: "",
  selfCheckIn: false,
  parking: false,
  images: [] as Array<{ url: string }>,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AdminAddPropertyModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminAddPropertyModalProps) {
  // Step: 0 = owner select, 1 = listing type, 2 = basic info + map, 3 = details + pricing, 4 = images
  const [step, setStep] = useState(0);
  const [owners, setOwners] = useState<EligibleOwner[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<EligibleOwner | null>(null);
  const [listingType, setListingType] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"short" | "long">("short");
  const [form, setForm] = useState({ ...initialForm });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch eligible owners on open
  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setSelectedOwner(null);
    setOwnerSearch("");
    setForm({ ...initialForm });
    setError("");
    setListingType("rent");
    setRentalType("short");
    fetchOwners();
  }, [isOpen]);

  const fetchOwners = useCallback(async () => {
    try {
      setOwnersLoading(true);
      // Fetch owners who have an active fullAdminSupport package
      const res = await api.get("/admin/owners?pageSize=100");
      const items: any[] = res.data?.data?.items ?? [];

      // Filter: only those with fullAdminSupport package (backend already tags ownerPackage)
      const eligible: EligibleOwner[] = items
        .filter((o: any) => o.hasFullAdminSupport || o.packageName)
        .map((o: any) => ({
          id: o.id,
          name: `${o.firstName || ""} ${o.lastName || ""}`.trim() || o.email,
          email: o.email,
          packageName: o.packageName || "Full Admin Support",
          propertyCount: o.propertyCount || 0,
        }));
      setOwners(eligible);
    } catch {
      // non-fatal
    } finally {
      setOwnersLoading(false);
    }
  }, []);

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((res, rej) => {
          reader.readAsDataURL(file);
          reader.onload = () => res(reader.result as string);
          reader.onerror = rej;
        });
        const up = await api.post("/upload", { image: base64, folder: "mykeys/properties" });
        const url = up.data.data.url;
        setForm((p) => ({ ...p, images: [...p.images, { url }] }));
      } catch {
        setError(`Failed to upload ${file.name}`);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
  }

  function removeImage(i: number) {
    setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit() {
    setError("");
    if (!form.title || !form.address || !form.propertyType) {
      setError("Title, address and property type are required");
      return;
    }
    if (listingType === "rent" && !form.price) {
      setError("Please enter the rental price");
      return;
    }
    if (listingType === "buy" && !form.propertyPrice) {
      setError("Please enter the property price");
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        ...(selectedOwner ? { ownerId: selectedOwner.id } : {}),
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode || null,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
        propertyType: form.propertyType,
        listingType: listingType === "buy" ? "BUY" : "RENT",
        bedrooms: form.beds ? parseInt(form.beds) : 0,
        bathrooms: form.baths ? parseInt(form.baths) : 0,
        sqft: form.sqft || null,
        guests: form.guests ? parseInt(form.guests) : 2,
        images: form.images.map((img, i) => ({ url: img.url, isPrimary: i === 0 })),
        status: "DRAFT",
      };

      if (listingType === "rent") {
        payload.rentalType = rentalType === "short" ? "SHORT_TERM" : "LONG_TERM";
        payload.price = parseFloat(form.price);
        payload.priceType = rentalType === "short" ? "NIGHTLY" : "MONTHLY";
        payload.securityDeposit = form.securityDeposit || null;
        payload.cleaningFee = form.cleaningFee || null;
        payload.serviceFee = form.serviceFee || null;
        payload.minStay = parseInt(form.minStay) || 1;
        payload.maxStay = parseInt(form.maxStay) || null;
        payload.checkInTime = form.checkInTime;
        payload.checkOutTime = form.checkOutTime;
        payload.selfCheckIn = form.selfCheckIn;
        payload.parking = form.parking;
        payload.yearBuilt = form.yearBuilt || null;
      } else {
        payload.propertyPrice = parseFloat(form.propertyPrice);
        payload.price = parseFloat(form.propertyPrice);
        payload.priceType = "TOTAL";
        payload.yearBuilt = form.yearBuilt || null;
        payload.parking = form.parking;
      }

      await api.post("/admin/properties", payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create property");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const steps = ["Owner", "Listing Type", "Location & Info", "Details & Pricing", "Photos"];

  // ─── Step 0: Owner Selection ───────────────
  const renderStep0 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Select an Owner</h3>
        <p className="text-sm text-gray-500 mt-1">
          Only owners with an active <span className="font-medium text-green-700">Full Admin Support</span> package
          are shown. Leave unselected to add the property under your admin account.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search owners by name or email…"
          value={ownerSearch}
          onChange={(e) => setOwnerSearch(e.target.value)}
        />
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {/* "Admin's own" option */}
        <button
          type="button"
          onClick={() => setSelectedOwner(null)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-[5px] border-2 text-left transition-all ${
            selectedOwner === null
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <Star className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Admin's Own Listing</p>
            <p className="text-xs text-gray-500">Property will be created under the admin account</p>
          </div>
          {selectedOwner === null && <Check className="ml-auto w-4 h-4 text-green-600" />}
        </button>

        {ownersLoading && (
          <div className="flex items-center justify-center py-6 text-gray-400">
            <Loader className="w-5 h-5 animate-spin mr-2" /> Loading owners…
          </div>
        )}

        {!ownersLoading && filteredOwners.length === 0 && ownerSearch && (
          <p className="text-center text-sm text-gray-500 py-4">No matching owners found</p>
        )}

        {filteredOwners.map((owner) => (
          <button
            key={owner.id}
            type="button"
            onClick={() => setSelectedOwner(owner)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[5px] border-2 text-left transition-all ${
              selectedOwner?.id === owner.id
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              <User className="w-4 h-4 text-green-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{owner.name}</p>
              <p className="text-xs text-gray-500 truncate">{owner.email}</p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0 bg-green-100 text-green-800">
              {owner.packageName}
            </Badge>
            {selectedOwner?.id === owner.id && <Check className="ml-1 w-4 h-4 text-green-600 shrink-0" />}
          </button>
        ))}
      </div>

      {selectedOwner && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-[5px] text-sm text-green-800">
          <Check className="w-4 h-4" />
          Adding property for <span className="font-semibold">{selectedOwner.name}</span>
        </div>
      )}
    </div>
  );

  // ─── Step 1: Listing Type ──────────────────
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Listing Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Short Stay",
            desc: "Airbnb-style, per night",
            icon: Hotel,
            color: "green",
            action: () => { setListingType("rent"); setRentalType("short"); },
            active: listingType === "rent" && rentalType === "short",
          },
          {
            label: "Long Term Rent",
            desc: "Monthly rentals",
            icon: Calendar,
            color: "blue",
            action: () => { setListingType("rent"); setRentalType("long"); },
            active: listingType === "rent" && rentalType === "long",
          },
          {
            label: "For Sale",
            desc: "One-time property sale",
            icon: TrendingUp,
            color: "purple",
            action: () => setListingType("buy"),
            active: listingType === "buy",
          },
        ].map(({ label, desc, icon: Icon, color, action, active }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`p-5 rounded-[5px] border-2 transition-all text-center ${
              active
                ? `border-${color}-500 bg-${color}-50`
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Step 2: Basic Info + Map ──────────────
  const renderStep2 = () => (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-900">Basic Information &amp; Location</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Property Title *</Label>
          <Input name="title" value={form.title} onChange={handleInput} placeholder="e.g., Modern 2-bed apartment in Canary Wharf" />
        </div>

        <div>
          <Label>Property Type *</Label>
          <select
            name="propertyType"
            value={form.propertyType}
            onChange={handleInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-[5px] text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Select type</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Country</Label>
          <Input name="country" value={form.country} onChange={handleInput} />
        </div>

        <div className="md:col-span-2">
          <Label>Pick Location on Map</Label>
          <div className="mt-1">
            <LocationPickerMap
              initialLat={form.latitude ? parseFloat(form.latitude) : undefined}
              initialLng={form.longitude ? parseFloat(form.longitude) : undefined}
              onLocationSelect={(loc: LocationResult) => {
                setForm((p) => ({
                  ...p,
                  latitude: String(loc.lat),
                  longitude: String(loc.lng),
                  ...(loc.address ? { address: loc.address } : {}),
                  ...(loc.city ? { city: loc.city } : {}),
                  ...(loc.state ? { state: loc.state } : {}),
                  ...(loc.zipCode ? { zipCode: loc.zipCode } : {}),
                }));
              }}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <Label>Street Address *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input name="address" value={form.address} onChange={handleInput} className="pl-9" placeholder="Street address" />
          </div>
        </div>

        <div>
          <Label>City</Label>
          <Input name="city" value={form.city} onChange={handleInput} placeholder="e.g., London" />
        </div>
        <div>
          <Label>State / County</Label>
          <Input name="state" value={form.state} onChange={handleInput} placeholder="e.g., Greater London" />
        </div>
        <div>
          <Label>Postal Code</Label>
          <Input name="zipCode" value={form.zipCode} onChange={handleInput} placeholder="e.g., E14 5AB" />
        </div>
        <div>
          <Label>Latitude</Label>
          <Input name="latitude" value={form.latitude} onChange={handleInput} placeholder="Auto-filled by map" readOnly />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input name="longitude" value={form.longitude} onChange={handleInput} placeholder="Auto-filled by map" readOnly />
        </div>

        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea name="description" value={form.description} onChange={handleInput} rows={3} placeholder="Describe the property…" />
        </div>
      </div>
    </div>
  );

  // ─── Step 3: Details + Pricing ────────────
  const renderStep3 = () => (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-gray-900">Property Details &amp; Pricing</h3>

      {/* Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>Bedrooms</Label>
          <div className="relative">
            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input name="beds" type="number" min="0" value={form.beds} onChange={handleInput} className="pl-9" />
          </div>
        </div>
        <div>
          <Label>Bathrooms</Label>
          <div className="relative">
            <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input name="baths" type="number" min="0" value={form.baths} onChange={handleInput} className="pl-9" />
          </div>
        </div>
        <div>
          <Label>Area (sq ft)</Label>
          <div className="relative">
            <Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input name="sqft" type="number" min="0" value={form.sqft} onChange={handleInput} className="pl-9" />
          </div>
        </div>
        {listingType === "rent" && rentalType === "short" && (
          <div>
            <Label>Max Guests</Label>
            <Input name="guests" type="number" min="1" value={form.guests} onChange={handleInput} />
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Pricing</h4>
        {listingType === "buy" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Property Price *</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input name="propertyPrice" type="number" min="0" value={form.propertyPrice} onChange={handleInput} className="pl-9" placeholder="Total sale price" />
              </div>
            </div>
            <div>
              <Label>Year Built</Label>
              <Input name="yearBuilt" type="number" value={form.yearBuilt} onChange={handleInput} placeholder="e.g., 2020" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" name="parking" checked={form.parking} onChange={handleInput} className="w-4 h-4 text-green-600 rounded" />
                Parking Available
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{rentalType === "short" ? "Price per Night *" : "Monthly Rent *"}</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input name="price" type="number" min="0" value={form.price} onChange={handleInput} className="pl-9" />
              </div>
            </div>
            {rentalType === "short" && (
              <>
                <div>
                  <Label>Cleaning Fee</Label>
                  <Input name="cleaningFee" type="number" min="0" value={form.cleaningFee} onChange={handleInput} />
                </div>
                <div>
                  <Label>Security Deposit</Label>
                  <Input name="securityDeposit" type="number" min="0" value={form.securityDeposit} onChange={handleInput} />
                </div>
                <div>
                  <Label>Min Stay (nights)</Label>
                  <Input name="minStay" type="number" min="1" value={form.minStay} onChange={handleInput} />
                </div>
                <div>
                  <Label>Max Stay (nights)</Label>
                  <Input name="maxStay" type="number" min="1" value={form.maxStay} onChange={handleInput} />
                </div>
                <div>
                  <Label>Check-in Time</Label>
                  <Input name="checkInTime" type="time" value={form.checkInTime} onChange={handleInput} />
                </div>
                <div>
                  <Label>Check-out Time</Label>
                  <Input name="checkOutTime" type="time" value={form.checkOutTime} onChange={handleInput} />
                </div>
              </>
            )}
            <div>
              <Label>Year Built</Label>
              <Input name="yearBuilt" type="number" value={form.yearBuilt} onChange={handleInput} placeholder="e.g., 2020" />
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" name="selfCheckIn" checked={form.selfCheckIn} onChange={handleInput} className="w-4 h-4 text-green-600 rounded" />
                Self Check-in
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" name="parking" checked={form.parking} onChange={handleInput} className="w-4 h-4 text-green-600 rounded" />
                Parking
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Step 4: Photos ────────────────────────
  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Property Photos</h3>
      <p className="text-sm text-gray-500">First image will be the cover photo.</p>

      <div
        className="border-2 border-dashed border-gray-300 rounded-[5px] p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Click to upload images (max 10 MB each)</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader className="w-4 h-4 animate-spin" /> Uploading…
        </div>
      )}

      {form.images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative group rounded-[5px] overflow-hidden aspect-square border">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                  Cover
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];
  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[5px] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Property</h2>
            {selectedOwner ? (
              <p className="text-sm text-green-700 font-medium">
                For: {selectedOwner.name}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Admin&apos;s own listing</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < step
                      ? "bg-green-600 text-white"
                      : i === step
                      ? "bg-green-600 text-white ring-2 ring-green-200"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`ml-1 text-xs hidden sm:block ${
                    i === step ? "text-green-700 font-medium" : "text-gray-400"
                  }`}
                >
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-[5px] text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {stepContent[step]()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => (isFirstStep ? onClose() : setStep((s) => s - 1))}
            disabled={submitting}
            className="rounded-[5px]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {isFirstStep ? "Cancel" : "Back"}
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" /> Create Property
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setStep((s) => s + 1)}
              className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
