"use client";

import { Target, TrendingUp, TrendingDown, Clock, Users, DollarSign, Home, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const metrics = [
  {
    title: "Revenue per Available Room",
    value: 6200,
    change: "+8.5%",
    trend: "up",
    icon: Home,
    description: "Daily average across all properties",
    target: 6500,
  },
  {
    title: "Booking Lead Time",
    value: "14.5",
    change: "+2.3",
    trend: "up",
    icon: Clock,
    description: "Average days between booking and stay",
    target: "12",
  },
  {
    title: "Direct Booking Rate",
    value: "42%",
    change: "+3.2%",
    trend: "up",
    icon: Target,
    description: "Bookings made directly vs platforms",
    target: "45%",
  },
  {
    title: "Guest Acquisition Cost",
    value: 1850,
    change: "-120",
    trend: "down",
    icon: DollarSign,
    description: "Cost to acquire each new guest",
    target: 1700,
  },
  {
    title: "Repeat Guest Rate",
    value: "28%",
    change: "+4.1%",
    trend: "up",
    icon: Users,
    description: "Percentage of returning guests",
    target: "30%",
  },
  {
    title: "Review Response Rate",
    value: "94%",
    change: "+2%",
    trend: "up",
    icon: Star,
    description: "Guests who leave reviews",
    target: "95%",
  },
];

export default function KeyMetrics() {
  const calculateProgress = (current: number | string, target: number | string) => {
    const curr = typeof current === 'string' ? parseFloat(current) : current;
    const targ = typeof target === 'string' ? parseFloat(target) : target;
    return Math.min((curr / targ) * 100, 100);
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
          <p className="text-sm text-gray-500 mt-1">
            Critical metrics for business growth
          </p>
        </div>
        <div className="p-2 bg-purple-100 rounded-lg">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const progress = calculateProgress(metric.value, metric.target);
          
          return (
            <div key={metric.title} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${
                    metric.trend === "up" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{metric.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    metric.trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}>
                    {metric.trend === "up" ? "+" : ""}{metric.change}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof metric.value === 'number' && metric.title.includes('Cost') 
                      ? `£${metric.value.toLocaleString()}`
                      : typeof metric.value === 'number'
                      ? metric.value.toLocaleString()
                      : metric.value}
                  </div>
                  <div className="text-xs text-gray-500">{metric.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Target</div>
                  <div className="font-medium">{metric.target}</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    progress >= 90 ? "bg-green-500" :
                    progress >= 70 ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Above Target</span>
            <span className="font-medium text-green-600">4 metrics</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Below Target</span>
            <span className="font-medium text-red-600">2 metrics</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Overall Performance</span>
            <span className="font-medium text-green-600">Good</span>
          </div>
          <div className="pt-3">
            <div className="text-xs text-gray-500">
              💡 Tip: Focus on improving Direct Booking Rate and Guest Acquisition Cost for maximum impact.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors">
          Set New Targets
        </button>
        <button className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors">
          View Insights
        </button>
      </div>
    </div>
  );
}