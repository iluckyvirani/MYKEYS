"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

interface ContactQueryItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  inquiryType: string;
  createdAt: string;
  status: string;
}

export default function AdminRecentContactQueries() {
  const [items, setItems] = useState<ContactQueryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/contact-queries?limit=6");
        setItems(res.data?.data?.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white rounded-[5px] border p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold text-gray-900">Recent Contact Queries</h3>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">No contact queries yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="rounded border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{q.subject}</p>
                  <p className="text-xs text-gray-500">
                    {q.name} • {q.inquiryType}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
                  {q.status}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {q.email}
                </p>
                {q.phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {q.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
