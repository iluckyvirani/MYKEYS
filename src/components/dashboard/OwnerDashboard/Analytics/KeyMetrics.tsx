"use client";

import { Target, TrendingUp, TrendingDown, Clock, Users, DollarSign, Star, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OwnerAnalyticsData } from "@/types/ownerAnalytics";

interface KeyMetricsProps {
  data: OwnerAnalyticsData;
  loading?: boolean;
}

export default function KeyMetrics({ data, loading }: KeyMetricsProps) {
  if (loading) {
    return <div className="bg-white rounded-[5px] border p-6 h-96 animate-pulse" />;
  }

  const { keyMetrics, stats } = data;

  const metrics = [
    {
      title: "Avg booking value",
      value: formatCurrency(keyMetrics.avgBookingValue),
      raw: keyMetrics.avgBookingValue,
      target: 500,
      icon: DollarSign,
      description: "Average paid booking amount",
      trend: keyMetrics.avgBookingValue >= 300 ? "up" : "down",
    },
    {
      title: "Booking lead time",
      value: `${keyMetrics.avgLeadTimeDays} days`,
      raw: keyMetrics.avgLeadTimeDays,
      target: 14,
      icon: Clock,
      description: "Days from booking to check-in",
      trend: keyMetrics.avgLeadTimeDays <= 21 ? "up" : "down",
    },
    {
      title: "Inquiry conversion",
      value: `${keyMetrics.conversionRate}%`,
      raw: keyMetrics.conversionRate,
      target: 25,
      icon: Target,
      description: "Inquiries converted to bookings",
      trend: keyMetrics.conversionRate >= 10 ? "up" : "down",
    },
    {
      title: "Repeat guest rate",
      value: `${keyMetrics.repeatGuestRate}%`,
      raw: keyMetrics.repeatGuestRate,
      target: 30,
      icon: Users,
      description: "Guests who booked more than once",
      trend: keyMetrics.repeatGuestRate >= 20 ? "up" : "down",
    },
    {
      title: "Review response rate",
      value: `${keyMetrics.reviewResponseRate}%`,
      raw: keyMetrics.reviewResponseRate,
      target: 80,
      icon: Star,
      description: "Reviews you have responded to",
      trend: keyMetrics.reviewResponseRate >= 50 ? "up" : "down",
    },
    {
      title: "Cancellation rate",
      value: `${keyMetrics.cancellationRate}%`,
      raw: keyMetrics.cancellationRate,
      target: 10,
      icon: Percent,
      description: "Lower is better",
      trend: keyMetrics.cancellationRate <= 15 ? "up" : "down",
      invertProgress: true,
    },
  ];

  const aboveTarget = metrics.filter((m) => {
    if ("invertProgress" in m && m.invertProgress) {
      return m.raw <= m.target;
    }
    return m.raw >= m.target;
  }).length;

  const calculateProgress = (current: number, target: number, invert?: boolean) => {
    if (invert) {
      if (current <= target) return 100;
      return Math.max(0, Math.min(100, Math.round((target / current) * 100)));
    }
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
          <p className="text-sm text-gray-500 mt-1">
            Owner metrics from real booking activity
          </p>
        </div>
        <div className="p-2 bg-purple-100 rounded-lg">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const invert = "invertProgress" in metric && metric.invertProgress;
          const progress = calculateProgress(metric.raw, metric.target, invert);

          return (
            <div key={metric.title} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`p-1.5 rounded shrink-0 ${
                      metric.trend === "up" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        metric.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {metric.title}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${
                    metric.trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 inline" />
                  )}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-xs text-gray-500">{metric.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Benchmark</div>
                  <div className="font-medium">
                    {metric.title.includes("%") || metric.value.includes("%")
                      ? `${metric.target}%`
                      : metric.title.includes("lead")
                      ? `${metric.target}d`
                      : formatCurrency(metric.target)}
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    progress >= 90 ? "bg-green-500" : progress >= 70 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Unique guests (period)</span>
            <span className="font-medium">{stats.uniqueGuests}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Repeat guests (all time)</span>
            <span className="font-medium">{stats.repeatGuests}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Metrics on track</span>
            <span className="font-medium text-green-600">
              {aboveTarget} / {metrics.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Occupancy</span>
            <span className="font-medium">{stats.occupancyRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
