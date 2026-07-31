"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsPeriod, OwnerAnalyticsData } from "@/types/ownerAnalytics";
import { OwnerPackageWithUsage } from "@/types/package";
import { AlertCircle, Printer, RefreshCw } from "lucide-react";

export default function OwnerReportsPage() {
  const [activePackage, setActivePackage] =
    useState<OwnerPackageWithUsage | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>("6m");
  const [data, setData] = useState<OwnerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const loadPackage = useCallback(async () => {
    try {
      const res = await api.get("/owner/packages");
      const pkg = res.data?.data ?? null;
      setActivePackage(pkg?.status === "ACTIVE" ? pkg : null);
    } catch (err) {
      console.error("Failed to load package:", err);
      setActivePackage(null);
    }
  }, []);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/owner/analytics?period=${period}`);
      if (res.data?.success && res.data.data) {
        setData(res.data.data);
      } else {
        setError("Failed to load report data.");
      }
    } catch (err) {
      console.error("Failed to load report:", err);
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleDownload = () => {
    if (!activePackage) {
      setDownloadMessage(
        "You don't have an active package to download this report."
      );
      return;
    }
    setDownloadMessage(null);
    window.print();
  };

  return (
    <DashboardLayout defaultRole="owner">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">
            Simple performance summary for your properties
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => loadReport()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-[5px] hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#339390] text-white rounded-[5px] hover:bg-[#2a7a78]"
          >
            <Printer className="w-4 h-4" />
            Download report
          </button>
        </div>
      </div>

      {downloadMessage && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-[5px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{downloadMessage}</p>
          </div>
          <Link
            href="/owner/dashboard/packages"
            className="text-sm font-medium text-[#339390] hover:underline shrink-0"
          >
            View packages
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[5px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border rounded-[5px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {activePackage ? (
              <>
                Package:{" "}
                <span className="font-semibold text-gray-900">
                  {activePackage.packageName}
                </span>
                <span className="mx-2 text-gray-300">·</span>
                {activePackage.daysRemaining} days left
              </>
            ) : (
              <span>View your property performance below</span>
            )}
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg print:hidden">
            {(["1m", "3m", "6m", "1y"] as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded-[5px] ${
                  period === p ? "bg-white shadow text-gray-900" : "text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading || !data ? (
          <div className="bg-white border rounded-[5px] p-10 animate-pulse h-64" />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Booking revenue",
                  value: formatCurrency(data.stats.bookingRevenue),
                },
                {
                  label: "Your earnings",
                  value: formatCurrency(data.stats.ownerEarnings),
                },
                {
                  label: "Bookings",
                  value: String(data.stats.totalBookings),
                },
                {
                  label: "Occupancy",
                  value: `${data.stats.occupancyRate}%`,
                },
              ].map((card) => (
                <div key={card.label} className="bg-white border rounded-[5px] p-4">
                  <div className="text-xs text-gray-500 mb-1">{card.label}</div>
                  <div className="text-xl font-bold text-gray-900">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border rounded-[5px] overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">Property performance</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Last {data.periodMonths} month
                  {data.periodMonths === 1 ? "" : "s"}
                </p>
              </div>
              {data.propertyPerformance.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center">
                  No property data for this period yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Property</th>
                        <th className="px-4 py-3 font-medium">Revenue</th>
                        <th className="px-4 py-3 font-medium">Bookings</th>
                        <th className="px-4 py-3 font-medium">Occupancy</th>
                        <th className="px-4 py-3 font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.propertyPerformance.map((p) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {p.title}
                          </td>
                          <td className="px-4 py-3">{formatCurrency(p.revenue)}</td>
                          <td className="px-4 py-3">{p.bookings}</td>
                          <td className="px-4 py-3">{p.occupancy}%</td>
                          <td className="px-4 py-3">
                            {p.rating > 0 ? p.rating.toFixed(1) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white border rounded-[5px] overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">Monthly trend</h2>
              </div>
              {data.monthlyTrend.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center">
                  No monthly data yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Month</th>
                        <th className="px-4 py-3 font-medium">Revenue</th>
                        <th className="px-4 py-3 font-medium">Earnings</th>
                        <th className="px-4 py-3 font-medium">Bookings</th>
                        <th className="px-4 py-3 font-medium">Occupancy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monthlyTrend.map((m) => (
                        <tr key={m.month} className="border-t">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {m.label}
                          </td>
                          <td className="px-4 py-3">{formatCurrency(m.revenue)}</td>
                          <td className="px-4 py-3">
                            {formatCurrency(m.ownerEarnings)}
                          </td>
                          <td className="px-4 py-3">{m.bookings}</td>
                          <td className="px-4 py-3">{m.occupancy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
