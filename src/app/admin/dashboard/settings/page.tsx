"use client";

import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Percent, Save, CheckCircle, Zap } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [commission, setCommission] = useState<number>(0);
  const [minBid, setMinBid] = useState<number>(1);
  const [maxDuration, setMaxDuration] = useState<number>(30);
  const [maxSlots, setMaxSlots] = useState<number>(3);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setCommission(data?.shortRentCommissionPercent ?? 0);
        setMinBid(data?.minBidAmountPerDay ?? 1);
        setMaxDuration(data?.maxBidDurationDays ?? 30);
        setMaxSlots(data?.maxBoostedSlotsPerZip ?? 3);
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/admin/settings", {
        shortRentCommissionPercent: commission,
        minBidAmountPerDay: minBid,
        maxBidDurationDays: maxDuration,
        maxBoostedSlotsPerZip: maxSlots,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-600" /> Platform Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Global settings applied across the platform
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Commission */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Percent className="w-5 h-5 text-green-600" /> Short Rent Commission
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Platform commission applied to every Short Rent booking payment. The
                owner receives the remainder. Changes apply to future bookings only —
                already-paid bookings are not recalculated.
              </p>
              <div className="space-y-1">
                <Label htmlFor="commission">Commission Percentage (%)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="commission"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={commission}
                    onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                    className="w-32"
                    required
                  />
                  <span className="text-gray-500 text-sm">% of each booking total</span>
                </div>
                <p className="text-xs text-gray-400">
                  Example: 10% on a £200 booking → platform takes £20, owner receives £180
                </p>
              </div>
            </Card>

            {/* Boost / Bid Config */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Boost / Bid Settings
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure rules for the Short Rent property boost bidding system.
              </p>
              <div className="space-y-5">
                <div className="space-y-1">
                  <Label htmlFor="minBid">Minimum Bid Amount (£/day)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="minBid"
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={minBid}
                      onChange={(e) => setMinBid(parseFloat(e.target.value) || 1)}
                      className="w-32"
                    />
                    <span className="text-gray-500 text-sm">£ per day</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Owners cannot place a bid below this amount.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="maxDuration">Maximum Boost Duration (days)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="maxDuration"
                      type="number"
                      min={1}
                      step={1}
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(parseInt(e.target.value) || 30)}
                      className="w-32"
                    />
                    <span className="text-gray-500 text-sm">days</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Maximum number of days an owner can set for a single boost period.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="maxSlots">Max Boosted Listings per Zip Code</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="maxSlots"
                      type="number"
                      min={1}
                      step={1}
                      value={maxSlots}
                      onChange={(e) => setMaxSlots(parseInt(e.target.value) || 3)}
                      className="w-32"
                    />
                    <span className="text-gray-500 text-sm">slots</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Maximum boosted properties shown at the top of search results for any zip code.
                  </p>
                </div>
              </div>
            </Card>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
            )}

            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded p-2">
                <CheckCircle className="w-4 h-4" /> Settings saved successfully
              </div>
            )}

            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving…" : "Save All Settings"}
            </Button>
          </form>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
