"use client";

import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Percent, Save, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [commission, setCommission] = useState<number>(0);

  useEffect(() => {
    api
      .get("/api/admin/settings")
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setCommission(data?.shortRentCommissionPercent ?? 0);
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
      await api.patch("/api/admin/settings", { shortRentCommissionPercent: commission });
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

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Percent className="w-5 h-5 text-green-600" /> Short Rent Commission
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Platform commission applied to every Short Rent booking payment. The
            owner receives the remainder. Changes apply to future bookings only —
            already-paid bookings are not recalculated.
          </p>

          {loading ? (
            <p className="text-gray-400">Loading…</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
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
                {saving ? "Saving…" : "Save Settings"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
