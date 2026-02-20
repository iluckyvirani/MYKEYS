"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function EarningsChart() {
  const data = [
    {
      week: "Week 1",
      earnings: 12000,
      bookings: 8,
    },
    {
      week: "Week 2",
      earnings: 15500,
      bookings: 11,
    },
    {
      week: "Week 3",
      earnings: 18200,
      bookings: 13,
    },
    {
      week: "Week 4",
      earnings: 21800,
      bookings: 15,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Earnings Overview
      </h2>

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
            formatter={(value) => `₹${value.toLocaleString()}`}
          />
          <Legend />
          <Bar dataKey="earnings" fill="#10b981" name="Earnings (₹)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" radius={[8, 8, 0, 0]} yAxisId="right" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-gray-900">₹67,500</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">47</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Avg Earning/Booking</p>
          <p className="text-2xl font-bold text-gray-900">₹1,436</p>
        </div>
      </div>
    </div>
  );
}
