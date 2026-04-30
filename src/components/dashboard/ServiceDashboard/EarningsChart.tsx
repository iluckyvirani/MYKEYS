"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ChartItem {
  week: string;
  earnings: number;
  bookings: number;
}

interface EarningsStats {
  thisMonth: number;
  thisMonthBookings: number;
}

export default function EarningsChart() {
  const [data, setData] = useState<ChartItem[]>([]);
  const [stats, setStats] = useState<EarningsStats>({ thisMonth: 0, thisMonthBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get("/service/earnings");
        const d = res.data?.data;
        if (d) {
          setData(d.weeklyChart || []);
          setStats({
            thisMonth: d.stats?.thisMonth || 0,
            thisMonthBookings: d.stats?.thisMonthBookings || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const totalEarnings = data.reduce((sum, d) => sum + d.earnings, 0);
  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0);
  const avgPerBooking = totalBookings > 0 ? Math.round(totalEarnings / totalBookings) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Earnings Overview
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-75">
          <p className="text-sm text-gray-500">Loading earnings data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-75">
          <p className="text-sm text-gray-500">No earnings data yet</p>
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value) => value !== undefined ? `£${(value as number).toLocaleString()}` : '-'}
          />
          <Legend />
          <Bar dataKey="earnings" fill="#10b981" name="Earnings (£)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" radius={[8, 8, 0, 0]} yAxisId="right" />
        </BarChart>
      </ResponsiveContainer>
      )}

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-gray-900">£{stats.thisMonth.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg Earning/Booking</p>
          <p className="text-2xl font-bold text-gray-900">£{avgPerBooking.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
