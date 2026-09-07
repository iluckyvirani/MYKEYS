"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Star, X } from "lucide-react";
import { api } from "@/lib/api";
import {
  ALERT_FREQUENCY_OPTIONS,
  buildSavedSearchName,
  type AlertFrequencyValue,
} from "@/lib/savedSearches/shared";

type FiltersSnapshot = Record<string, string | number | boolean | null | undefined>;

type Props = {
  location: string;
  listingType: "BUY" | "RENT";
  rentalType?: "SHORT_TERM" | "LONG_TERM" | null;
  filters: FiltersSnapshot;
};

function isLoggedIn() {
  return typeof window !== "undefined" && !!localStorage.getItem("accessToken");
}

function loginRedirect(pathname: string) {
  return `/login?redirect=${encodeURIComponent(pathname)}`;
}

export default function SaveSearchAlertActions({
  location,
  listingType,
  rentalType = null,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState<AlertFrequencyValue>("INSTANTLY");
  const [savingSearch, setSavingSearch] = useState(false);
  const [creatingAlert, setCreatingAlert] = useState(false);
  const [searchSaved, setSearchSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const alertTitle = buildSavedSearchName({
    listingType,
    rentalType,
    location,
  });

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  const requireLogin = () => {
    if (isLoggedIn()) return true;
    router.push(loginRedirect(pathname || "/"));
    return false;
  };

  const payloadBase = () => ({
    location: location.trim(),
    listingType,
    rentalType: listingType === "RENT" ? rentalType || "LONG_TERM" : null,
    filters,
    name: alertTitle,
  });

  const handleSaveSearch = async () => {
    if (!requireLogin()) return;
    if (!location.trim()) {
      setMessage("Choose a location first");
      return;
    }
    setSavingSearch(true);
    try {
      const res = await api.post("/saved-searches", {
        ...payloadBase(),
        alertEnabled: false,
      });
      if (res.data?.success) {
        setSearchSaved(true);
        setMessage("Search saved");
      } else {
        setMessage(res.data?.message || "Failed to save search");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push(loginRedirect(pathname || "/"));
        return;
      }
      setMessage(err?.response?.data?.message || "Failed to save search");
    } finally {
      setSavingSearch(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!requireLogin()) return;
    if (!location.trim()) {
      setMessage("Choose a location first");
      return;
    }
    setCreatingAlert(true);
    try {
      const res = await api.post("/saved-searches", {
        ...payloadBase(),
        alertEnabled: true,
        alertFrequency: frequency,
      });
      if (res.data?.success) {
        setOpen(false);
        setSearchSaved(true);
        setMessage("Alert created");
      } else {
        setMessage(res.data?.message || "Failed to create alert");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push(loginRedirect(pathname || "/"));
        return;
      }
      setMessage(err?.response?.data?.message || "Failed to create alert");
    } finally {
      setCreatingAlert(false);
    }
  };

  const openAlertPanel = () => {
    if (!requireLogin()) return;
    setOpen((v) => !v);
  };

  return (
    <div className="relative inline-flex items-center gap-x-5" ref={panelRef}>
      <button
        type="button"
        onClick={handleSaveSearch}
        disabled={savingSearch}
        className="inline-flex items-center gap-1.5 hover:text-[#0f172a] cursor-pointer disabled:opacity-60"
      >
        <Star
          className={`w-[15px] h-[15px] ${
            searchSaved ? "fill-amber-400 text-amber-500" : ""
          }`}
          strokeWidth={1.75}
        />
        {savingSearch ? "Saving…" : searchSaved ? "Search saved" : "Save Search"}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={openAlertPanel}
          className="inline-flex items-center gap-1.5 hover:text-[#0f172a] cursor-pointer"
        >
          <span className="relative inline-flex">
            <Bell className="w-[15px] h-[15px]" strokeWidth={1.75} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#e87722] border border-white" />
          </span>
          Create Alert
        </button>

        {open && (
          <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 z-50 w-[280px] rounded-lg bg-[#0f172a] text-white shadow-xl border border-slate-700 p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-semibold">Notify me about...</p>
                <p className="text-[13px] text-slate-300 mt-1 leading-snug">
                  {alertTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer p-0.5"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as AlertFrequencyValue)
              }
              className="w-full rounded-md bg-white text-[#0f172a] text-sm font-semibold px-3 py-2.5 outline-none cursor-pointer mb-3"
            >
              {ALERT_FREQUENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCreateAlert}
              disabled={creatingAlert}
              className="w-full rounded-md bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] font-bold text-sm py-2.5 cursor-pointer disabled:opacity-60"
            >
              {creatingAlert ? "Creating…" : "Create Alert"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <span className="absolute left-0 top-full mt-2 whitespace-nowrap text-xs font-semibold text-green-700 bg-white border border-green-200 rounded px-2 py-1 shadow-sm z-40">
          {message}
        </span>
      )}
    </div>
  );
}
