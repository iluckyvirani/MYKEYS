"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Bell, Search, Trash2, ExternalLink, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ALERT_FREQUENCY_OPTIONS,
  type AlertFrequencyValue,
} from "@/lib/savedSearches/shared";
import { savedSearchResultsHref } from "@/lib/savedSearches/resultsUrl";

type SavedSearchRow = {
  id: string;
  name: string;
  location: string;
  listingType: "BUY" | "RENT";
  rentalType?: "SHORT_TERM" | "LONG_TERM" | null;
  filters?: Record<string, unknown>;
  alertEnabled: boolean;
  alertFrequency?: AlertFrequencyValue | null;
  lastNotifiedAt?: string | null;
  createdAt: string;
};

function listingLabel(row: SavedSearchRow) {
  if (row.listingType === "BUY") return "For sale";
  if (row.rentalType === "SHORT_TERM") return "Short stay";
  const kind = row.filters?.kind;
  if (kind === "room-to-rent") return "Room to rent";
  return "To rent";
}

function frequencyLabel(value?: string | null) {
  return (
    ALERT_FREQUENCY_OPTIONS.find((o) => o.value === value)?.label || "Off"
  );
}

export default function SavedSearchesPage() {
  const [items, setItems] = useState<SavedSearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/saved-searches");
      if (res.data?.success) {
        const payload = res.data.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
        setItems(list);
      } else {
        setError(res.data?.message || "Failed to load saved searches");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load saved searches"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Remove this saved search?")) return;
    try {
      setBusyId(id);
      await api.delete(`/saved-searches/${id}`);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const patchAlert = async (
    id: string,
    data: { alertEnabled?: boolean; alertFrequency?: AlertFrequencyValue }
  ) => {
    try {
      setBusyId(id);
      const res = await api.patch(`/saved-searches/${id}`, data);
      if (res.data?.success && res.data.data) {
        setItems((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...res.data.data } : s))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update alert");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout defaultRole="user">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved searches</h1>
            <p className="text-gray-600 mt-2">
              Manage your saved searches and email alerts for new listings
            </p>
          </div>
          <Link href="/buy">
            <Button className="cursor-pointer rounded-[5px]">
              <Search className="w-4 h-4 mr-2" />
              New search
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-[5px] border">
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          <div className="text-sm text-gray-600">Saved searches</div>
        </div>
        <div className="bg-white p-5 rounded-[5px] border">
          <div className="text-2xl font-bold text-green-600">
            {items.filter((i) => i.alertEnabled).length}
          </div>
          <div className="text-sm text-gray-600">Alerts on</div>
        </div>
        <div className="bg-white p-5 rounded-[5px] border">
          <div className="text-2xl font-bold text-blue-600">
            {items.filter((i) => !i.alertEnabled).length}
          </div>
          <div className="text-sm text-gray-600">Alerts off</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader className="w-6 h-6 animate-spin mr-2" />
          Loading saved searches...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-[5px] p-4">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border rounded-[5px] p-10 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No saved searches yet
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Save a search from buy or rent results to get alerts when new
            matching properties appear.
          </p>
          <Link href="/buy/search">
            <Button className="cursor-pointer rounded-[5px]">
              Start a buy search
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((row) => {
            const href = savedSearchResultsHref(row);
            const busy = busyId === row.id;
            return (
              <div
                key={row.id}
                className="bg-white border rounded-[5px] p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base font-bold text-gray-900 truncate">
                      {row.name}
                    </h2>
                    <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {listingLabel(row)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {row.location}
                    {row.alertEnabled
                      ? ` · Alert: ${frequencyLabel(row.alertFrequency)}`
                      : " · Alert off"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Saved{" "}
                    {new Date(row.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {row.lastNotifiedAt
                      ? ` · Last notified ${new Date(
                          row.lastNotifiedAt
                        ).toLocaleDateString("en-GB")}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mr-1">
                    <input
                      type="checkbox"
                      checked={row.alertEnabled}
                      disabled={busy}
                      onChange={(e) =>
                        patchAlert(row.id, { alertEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-green-600 rounded cursor-pointer"
                    />
                    Alert
                  </label>

                  <select
                    disabled={busy || !row.alertEnabled}
                    value={row.alertFrequency || "INSTANTLY"}
                    onChange={(e) =>
                      patchAlert(row.id, {
                        alertEnabled: true,
                        alertFrequency: e.target
                          .value as AlertFrequencyValue,
                      })
                    }
                    className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white disabled:opacity-50"
                  >
                    {ALERT_FREQUENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <Link href={href}>
                    <Button
                      variant="outline"
                      className="cursor-pointer rounded-[5px]"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      View results
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => remove(row.id)}
                    className="cursor-pointer rounded-[5px] text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
