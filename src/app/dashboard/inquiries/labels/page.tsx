"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Tag } from "lucide-react";
import { api } from "@/lib/api";

const LABELS = [
  { name: "Viewing arranged",      color: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  { name: "Viewing completed",     color: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500" },
  { name: "Suitable",              color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  { name: "Maybe",                 color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  { name: "Rejected",              color: "bg-red-100 text-red-700 border-red-200",          dot: "bg-red-500" },
  { name: "Waiting for paperwork", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
];

interface LabelStat {
  name: string;
  count: number;
}

export default function ManageLabelsPage() {
  const [stats, setStats] = useState<LabelStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/inquiries?pageSize=200&tab=all");
        const items = res.data?.data?.items || [];
        const counts: Record<string, number> = {};
        for (const label of LABELS) counts[label.name] = 0;
        for (const item of items) {
          if (item.userLabel && counts[item.userLabel] !== undefined) {
            counts[item.userLabel]++;
          }
        }
        setStats(LABELS.map((l) => ({ name: l.name, count: counts[l.name] })));
      } catch {
        setStats(LABELS.map((l) => ({ name: l.name, count: 0 })));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout defaultRole="user">
      <div className="mb-6">
        <Link href="/dashboard/inquiries" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Inquiries
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Manage Labels</h1>
        <p className="text-gray-500 text-sm mt-1">Labels help you organise your inquiry threads.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600" />
        </div>
      ) : (
        <div className="bg-white rounded-[5px] border divide-y">
          {LABELS.map((label) => {
            const stat = stats.find((s) => s.name === label.name);
            return (
              <Link
                key={label.name}
                href={`/dashboard/inquiries?label=${encodeURIComponent(label.name)}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${label.dot}`} />
                  <span className={`text-sm px-2 py-0.5 rounded-full font-medium border ${label.color}`}>{label.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {stat && stat.count > 0 ? (
                    <span className="font-semibold text-gray-800">{stat.count}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                  <span>thread{stat?.count !== 1 ? "s" : ""}</span>
                  <Tag className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Labels are applied per conversation. Click a label to filter your inbox.
      </p>
    </DashboardLayout>
  );
}
