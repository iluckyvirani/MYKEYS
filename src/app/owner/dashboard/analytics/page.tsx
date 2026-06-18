"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AnalyticsCharts from "@/components/dashboard/OwnerDashboard/Analytics/AnalyticsCharts";
import AnalyticsStats from "@/components/dashboard/OwnerDashboard/Analytics/AnalyticsStats";
import KeyMetrics from "@/components/dashboard/OwnerDashboard/Analytics/KeyMetrics";
import { api } from "@/lib/api";
import { AnalyticsPeriod, OwnerAnalyticsData } from "@/types/ownerAnalytics";
import { AlertCircle } from "lucide-react";

export default function OwnerAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("6m");
  const [data, setData] = useState<OwnerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/owner/analytics?period=${period}`);
      if (response.data?.success && response.data.data) {
        setData(response.data.data);
      } else {
        setError("Failed to load analytics");
      }
    } catch (err: any) {
      console.error("Error fetching owner analytics:", err);
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const updatedLabel = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <DashboardLayout defaultRole="owner">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Bookings, revenue, guests, boosts, and packages for your properties
            </p>
          </div>
          <div className="text-sm text-gray-500">Data updated: {updatedLabel}</div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[5px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {data && (
        <>
          <div className="mb-6">
            <AnalyticsStats data={data} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsCharts
              data={data}
              period={period}
              onPeriodChange={setPeriod}
              loading={loading}
            />
            <KeyMetrics data={data} loading={loading} />
          </div>
        </>
      )}

      {!data && loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[5px] p-4 border animate-pulse h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[5px] border h-96 animate-pulse" />
            <div className="bg-white rounded-[5px] border h-96 animate-pulse" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
