"use client";

import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";
import { setStoredUser } from "@/lib/auth/storedUser";

interface OwnerListingProfileFormProps {
  onSuccess?: () => void;
}

export default function OwnerListingProfileForm({
  onSuccess,
}: OwnerListingProfileFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setInitialLoading(true);
        const response = await api.get<MeResponse>("/auth/me");
        const user = response.data?.data as UserDTO | undefined;
        if (!user) return;
        setCompanyName(user.companyName || "");
        setPhone(user.phone || "");
        setCity(user.city || "");
      } catch {
        setError("Failed to load listing profile");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/auth/profile", {
        companyName: companyName.trim() || "",
        phone: phone.trim() || "",
        city: city.trim() || "",
      });
      const user = response.data?.data || response.data;
      if (user) {
        setStoredUser(user);
        setSuccess("Listing profile updated successfully!");
        onSuccess?.();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
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
          Optional display details for your owner listings. Contact visibility depends on your package.
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

      <div className="flex items-start gap-3 p-4 rounded-[5px] border border-green-200 bg-green-50">
        <Home className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-gray-900">Property owner / landlord</div>
          <div className="text-xs text-gray-500 mt-1">
            List and manage your own properties from the owner dashboard.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Display name (optional)</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Private Owner"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="listingPhone">Phone number (optional)</Label>
          <Input
            id="listingPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 020 8016 0527"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="listingCity">City / area</Label>
          <Input
            id="listingCity"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. London"
            className="mt-1.5"
          />
        </div>
      </div>

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
