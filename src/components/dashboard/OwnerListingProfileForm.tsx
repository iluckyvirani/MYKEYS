"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Home, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";

interface OwnerListingProfileFormProps {
  onSuccess?: () => void;
}

export default function OwnerListingProfileForm({
  onSuccess,
}: OwnerListingProfileFormProps) {
  const [sellerType, setSellerType] = useState<"AGENT" | "PROPERTY_OWNER" | "">(
    ""
  );
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [agentLogo, setAgentLogo] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setInitialLoading(true);
        const response = await api.get<MeResponse>("/auth/me");
        const user = response.data?.data as UserDTO | undefined;
        if (!user) return;
        setSellerType(user.listingSellerType || "");
        setCompanyName(user.companyName || "");
        setPhone(user.phone || "");
        setCity(user.city || "");
        setAgentLogo(user.agentLogo || "");
      } catch {
        setError("Failed to load listing profile");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    try {
      setUploading(true);
      setError("");
      const base64 = await fileToBase64(file);
      const uploadResponse = await api.post("/upload", {
        image: base64,
        folder: "mykeys/agent-logos",
      });
      const url = uploadResponse.data?.data?.url as string;
      setAgentLogo(url);
      setSuccess("Logo uploaded. Click Save to apply.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setFieldErrors({});
    setSuccess("");

    const errors: Record<string, string[]> = {};
    if (!sellerType) {
      errors.listingSellerType = ["Please choose Agent or Property Owner"];
    }
    if (sellerType === "AGENT") {
      if (!companyName.trim()) {
        errors.companyName = ["Agency / company name is required"];
      }
      if (!phone.trim()) {
        errors.phone = ["Phone number is required for agents"];
      }
      if (!agentLogo.trim()) {
        errors.agentLogo = ["Agent logo is required"];
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the validation errors below.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.patch("/auth/profile", {
        listingSellerType: sellerType,
        companyName: companyName.trim() || "",
        phone: phone.trim() || "",
        city: city.trim() || "",
        agentLogo: agentLogo.trim() || "",
      });
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data || response.data));
        setSuccess("Listing profile updated successfully!");
        onSuccess?.();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || "Failed to update listing profile");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 border-b pb-8 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Listing identity</h3>
        <p className="text-sm text-gray-500 mt-1">
          Tell buyers whether you list as an estate agent or a private property owner.
          This appears on search result cards.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[5px] text-sm">
          {success}
        </div>
      )}

      <div>
        <Label className="mb-3 block">I am a *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSellerType("AGENT")}
            className={`cursor-pointer flex items-start gap-3 p-4 rounded-[5px] border text-left transition-colors ${
              sellerType === "AGENT"
                ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Building2 className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">Estate agent</div>
              <div className="text-xs text-gray-500 mt-1">
                Requires agency name, phone, and logo on every listing card
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSellerType("PROPERTY_OWNER")}
            className={`cursor-pointer flex items-start gap-3 p-4 rounded-[5px] border text-left transition-colors ${
              sellerType === "PROPERTY_OWNER"
                ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Home className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-gray-900">Property owner</div>
              <div className="text-xs text-gray-500 mt-1">
                Private landlord / owner — logo optional
              </div>
            </div>
          </button>
        </div>
        {fieldErrors.listingSellerType && (
          <p className="text-sm text-red-600 mt-2">{fieldErrors.listingSellerType[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">
            {sellerType === "AGENT" ? "Agency / company name *" : "Display name (optional)"}
          </Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={
              sellerType === "AGENT" ? "e.g. Flagstones Property Group" : "e.g. Private Owner"
            }
            className="mt-1.5"
          />
          {fieldErrors.companyName && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.companyName[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="listingPhone">
            Phone number {sellerType === "AGENT" ? "*" : "(optional)"}
          </Label>
          <Input
            id="listingPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 020 8016 0527"
            className="mt-1.5"
          />
          {fieldErrors.phone && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.phone[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="listingCity">City / area (shown after name)</Label>
          <Input
            id="listingCity"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. London"
            className="mt-1.5"
          />
        </div>
      </div>

      {sellerType === "AGENT" && (
        <div>
          <Label>
            Agent logo * <span className="text-gray-500 font-normal">(shown on result cards)</span>
          </Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-16 h-16 rounded-[4px] border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
              {agentLogo ? (
                <img src={agentLogo} alt="Agent logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading…" : agentLogo ? "Change logo" : "Upload logo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {fieldErrors.agentLogo && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.agentLogo[0]}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="cursor-pointer bg-green-600 hover:bg-green-700"
      >
        {loading ? "Saving…" : "Save listing identity"}
      </Button>
    </div>
  );
}
