"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { MessageSquare, Search, SortAsc, Building } from "lucide-react";
import { api } from "@/lib/api";

interface InquiryThread {
  id: string;
  guestName: string;
  guestEmail: string;
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  ownerEmail: string;
  message: string;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW:       { label: "New",       color: "bg-blue-100 text-blue-800" },
  READ:      { label: "Read",      color: "bg-gray-100 text-gray-700" },
  REPLIED:   { label: "Replied",   color: "bg-green-100 text-green-800" },
  CONVERTED: { label: "Converted", color: "bg-indigo-100 text-indigo-800" },
  CLOSED:    { label: "Closed",    color: "bg-gray-200 text-gray-600" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

type Tab = "all" | "pending" | "replied" | "closed";
type SortKey = "newest" | "oldest" | "name";

export default function AdminInquiriesPage() {
  const [threads, setThreads] = useState<InquiryThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/inquiries?pageSize=200");
      if (res.data?.success && res.data?.data?.items) {
        setThreads(
          res.data.data.items.map((i: any) => ({
            id: i.id,
            guestName: i.userName || "Guest",
            guestEmail: i.userEmail || "",
            propertyId: i.propertyId,
            propertyTitle: i.propertyTitle || "Property",
            ownerName: i.ownerName || "",
            ownerEmail: i.ownerEmail || "",
            message: i.message || "",
            status: i.status || "NEW",
            createdAt: i.createdAt,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const applySort = (list: InquiryThread[]) =>
    [...list].sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "name") return a.guestName.localeCompare(b.guestName);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filtered = applySort(
    threads.filter((t) => {
      const q = search.toLowerCase();
      if (
        q &&
        !t.guestName.toLowerCase().includes(q) &&
        !t.propertyTitle.toLowerCase().includes(q) &&
        !t.ownerName.toLowerCase().includes(q) &&
        !t.message.toLowerCase().includes(q)
      )
        return false;
      if (tab === "pending") return t.status === "NEW" || t.status === "READ";
      if (tab === "replied") return t.status === "REPLIED" || t.status === "CONVERTED";
      if (tab === "closed") return t.status === "CLOSED";
      return true;
    })
  );

  const pendingCount = threads.filter((t) => t.status === "NEW" || t.status === "READ").length;
  const repliedCount = threads.filter((t) => t.status === "REPLIED" || t.status === "CONVERTED").length;
  const closedCount  = threads.filter((t) => t.status === "CLOSED").length;

  const TABS = [
    { key: "all" as Tab,     label: "All",     count: threads.length },
    { key: "pending" as Tab, label: "Pending", count: pendingCount   },
    { key: "replied" as Tab, label: "Replied", count: repliedCount   },
    { key: "closed" as Tab,  label: "Closed",  count: closedCount    },
  ];

  const SORT_LABELS: Record<SortKey, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    name:   "By name",
  };

  return (
    <AdminDashboardLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-600 mt-1">Monitor all property inquiry conversations</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Total",   value: threads.length, cls: "text-gray-900"   },
            { label: "Pending", value: pendingCount,   cls: "text-orange-600" },
            { label: "Replied", value: repliedCount,   cls: "text-green-600"  },
            { label: "Closed",  value: closedCount,    cls: "text-gray-500"   },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[5px] border p-4">
              <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Sort */}
      <div className="bg-white rounded-[5px] border p-4 mb-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tenant, owner or property..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 border rounded-[5px] text-sm text-gray-600 bg-white hover:bg-gray-50"
            >
              <SortAsc className="w-4 h-4" />
              {SORT_LABELS[sort]}
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white border rounded-[5px] shadow-lg z-20 py-1">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSort(s); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sort === s ? "font-semibold text-gray-900" : "text-gray-600"}`}
                  >
                    {SORT_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-white rounded-t-[5px] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? "border-b-2 border-green-600 text-green-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  tab === t.key ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="bg-white rounded-b-[5px] border border-t-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No inquiries found</p>
            {search && <p className="text-sm text-gray-400 mt-1">Try a different search term</p>}
          </div>
        ) : (
          filtered.map((thread) => {
            const statusCfg = STATUS_CONFIG[thread.status] || STATUS_CONFIG.NEW;
            return (
              <div
                key={thread.id}
                className="flex items-start gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-sm font-bold text-gray-600 mt-0.5">
                  {thread.guestName.charAt(0).toUpperCase()}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{thread.guestName}</span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-600 truncate">{thread.propertyTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500">Owner: {thread.ownerName}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-1 max-w-xl">{thread.message}</p>
                </div>

                {/* Right: time, status, button */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs text-gray-400">{timeAgo(thread.createdAt)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  <Link
                    href={`/admin/dashboard/inquiries/${thread.id}`}
                    className="text-xs font-medium text-green-600 hover:text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-[5px] transition-colors mt-0.5"
                  >
                    Show Chat →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminDashboardLayout>
  );
}
