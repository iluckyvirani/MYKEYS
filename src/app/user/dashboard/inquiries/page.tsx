"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Search, Home, ChevronRight, MailOpen, Trash2, Tag, SortAsc, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface InquiryThread {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerName: string;
  lastMessage: string;
  lastMessageAt: string | null;
  lastMessageRole: string;
  status: string;
  unreadByUser: number;
  userLabel: string | null;
  isDeletedByUser: boolean;
  createdAt: string;
}

const LABELS = [
  "Viewing arranged", "Viewing completed", "Suitable",
  "Maybe", "Rejected", "Waiting for paperwork",
];

const LABEL_COLORS: Record<string, string> = {
  "Viewing arranged":      "bg-blue-100 text-blue-700",
  "Viewing completed":     "bg-green-100 text-green-700",
  "Suitable":              "bg-emerald-100 text-emerald-700",
  "Maybe":                 "bg-yellow-100 text-yellow-700",
  "Rejected":              "bg-red-100 text-red-700",
  "Waiting for paperwork": "bg-purple-100 text-purple-700",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW:       { label: "New",       color: "bg-blue-100 text-blue-800" },
  READ:      { label: "Read",      color: "bg-gray-100 text-gray-700" },
  REPLIED:   { label: "Replied",   color: "bg-green-100 text-green-800" },
  CONVERTED: { label: "Converted", color: "bg-indigo-100 text-indigo-800" },
  CLOSED:    { label: "Closed",    color: "bg-gray-200 text-gray-600" },
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
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

type Tab = "all" | "unread" | "not-replied" | "deleted";
type SortKey = "newest" | "oldest" | "name";

export default function UserInquiriesPage() {
  const [threads, setThreads] = useState<InquiryThread[]>([]);
  const [deletedThreads, setDeletedThreads] = useState<InquiryThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [labelFilter, setLabelFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { toast } = useToast();

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const [activeRes, deletedRes] = await Promise.all([
        api.get("/inquiries?pageSize=100&tab=all"),
        api.get("/inquiries?pageSize=100&tab=deleted"),
      ]);
      if (activeRes.data?.success && activeRes.data.data?.items) {
        setThreads(activeRes.data.data.items.map((inq: any) => ({
          id: inq.id,
          propertyId: inq.propertyId,
          propertyTitle: inq.propertyTitle || "Property",
          ownerName: inq.ownerName || "",
          lastMessage: inq.lastMessage || inq.message || "",
          lastMessageAt: inq.lastMessageAt || inq.updatedAt || inq.createdAt,
          lastMessageRole: inq.lastMessageRole || "USER",
          status: inq.status || "NEW",
          unreadByUser: inq.unreadByUser || 0,
          userLabel: inq.userLabel || null,
          isDeletedByUser: false,
          createdAt: inq.createdAt,
        })));
      }
      if (deletedRes.data?.success && deletedRes.data.data?.items) {
        setDeletedThreads(deletedRes.data.data.items.map((inq: any) => ({
          id: inq.id,
          propertyId: inq.propertyId,
          propertyTitle: inq.propertyTitle || "Property",
          ownerName: inq.ownerName || "",
          lastMessage: inq.lastMessage || inq.message || "",
          lastMessageAt: inq.lastMessageAt || inq.updatedAt || inq.createdAt,
          lastMessageRole: inq.lastMessageRole || "USER",
          status: inq.status || "CLOSED",
          unreadByUser: 0,
          userLabel: inq.userLabel || null,
          isDeletedByUser: true,
          createdAt: inq.createdAt,
        })));
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const applySort = (list: InquiryThread[]) => {
    return [...list].sort((a, b) => {
      if (sort === "oldest") return new Date(a.lastMessageAt || a.createdAt).getTime() - new Date(b.lastMessageAt || b.createdAt).getTime();
      if (sort === "name") return a.propertyTitle.localeCompare(b.propertyTitle);
      return new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime();
    });
  };

  const getFiltered = (): InquiryThread[] => {
    const source = tab === "deleted" ? deletedThreads : threads;
    return applySort(source.filter((t) => {
      const q = search.toLowerCase();
      if (q && !t.propertyTitle.toLowerCase().includes(q) && !t.lastMessage.toLowerCase().includes(q) && !t.ownerName.toLowerCase().includes(q)) return false;
      if (labelFilter !== "all" && t.userLabel !== labelFilter) return false;
      if (tab === "unread") return t.unreadByUser > 0;
      if (tab === "not-replied") return t.lastMessageRole !== "USER" && t.status !== "CLOSED";
      return true;
    }));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/inquiries/${id}`);
      setThreads(prev => prev.filter(t => t.id !== id));
      toast({ title: "Conversation deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const filtered = getFiltered();
  const unreadCount = threads.filter(t => t.unreadByUser > 0).length;
  const notRepliedCount = threads.filter(t => t.lastMessageRole !== "USER" && t.status !== "CLOSED").length;

  const TABS = [
    { key: "all" as Tab,         label: "All Inquiries",   count: threads.length },
    { key: "unread" as Tab,      label: "Unread",           count: unreadCount },
    { key: "not-replied" as Tab, label: "Not Replied To",   count: notRepliedCount },
    { key: "deleted" as Tab,     label: "Deleted",          count: deletedThreads.length },
  ];

  const SORT_LABELS: Record<SortKey, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    name: "By property name",
  };

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Inquiries</h1>
            <p className="text-gray-600 mt-2">Your conversations with property owners</p>
          </div>
          <Link href="/dashboard/inquiries/labels" className="text-sm text-green-600 hover:underline flex items-center gap-1 self-start md:self-auto">
            <Tag className="w-3.5 h-3.5" /> Manage labels
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{threads.length}</div>
                <div className="text-sm text-gray-600">All Inquiries</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Active conversations</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{unreadCount}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <MailOpen className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Requires attention</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{notRepliedCount}</div>
                <div className="text-sm text-gray-600">Not Replied</div>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Awaiting response</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{deletedThreads.length}</div>
                <div className="text-sm text-gray-600">Deleted</div>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">Archived conversations</div>
          </div>
        </div>
      </div>

      {/* Search + Filters Bar */}
      <div className="bg-white rounded-[5px] border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by property, owner or message..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => { setShowLabelDropdown(v => !v); setShowSortDropdown(false); }} className="flex items-center gap-2 px-3 py-2 border rounded-[5px] text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                <Tag className="w-4 h-4" />
                {labelFilter === "all" ? "All labels" : labelFilter}
                {labelFilter !== "all" && <X className="w-3 h-3" />}
              </button>
              {showLabelDropdown && (
                <div className="absolute right-0 mt-1 w-56 bg-white border rounded-[5px] shadow-lg z-20 py-1">
                  <button onClick={() => { setLabelFilter("all"); setShowLabelDropdown(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-500">All labels</button>
                  {LABELS.map(l => <button key={l} onClick={() => { setLabelFilter(l); setShowLabelDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${labelFilter === l ? "font-semibold text-green-700" : ""}`}>{l}</button>)}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => { setShowSortDropdown(v => !v); setShowLabelDropdown(false); }} className="flex items-center gap-2 px-3 py-2 border rounded-[5px] text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                <SortAsc className="w-4 h-4" />
                {SORT_LABELS[sort]}
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-1 w-44 bg-white border rounded-[5px] shadow-lg z-20 py-1">
                  {(Object.keys(SORT_LABELS) as SortKey[]).map(s => <button key={s} onClick={() => { setSort(s); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sort === s ? "font-semibold text-green-700" : ""}`}>{SORT_LABELS[s]}</button>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200 overflow-x-auto bg-white rounded-t-[5px]">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? "text-green-700 border-b-2 border-green-600 -mb-px" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
            {t.count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${tab === t.key ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Thread List */}
      <div className="bg-white rounded-b-[5px] border border-t-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-semibold mb-1">No conversations found</h3>
            <p className="text-gray-500 text-sm">
              {tab === "all" ? "Browse properties and send your first inquiry." : "Nothing to show here."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((thread) => {
              const statusCfg = STATUS_CONFIG[thread.status] || STATUS_CONFIG.NEW;
              const hasUnread = thread.unreadByUser > 0;
              return (
                <li key={thread.id} className="relative group">
                  <Link
                    href={`/dashboard/inquiries/${thread.id}`}
                    className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${hasUnread ? "bg-green-50/40" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasUnread ? "bg-green-100" : "bg-gray-100"}`}>
                      {hasUnread ? <MailOpen className="w-5 h-5 text-green-600" /> : <Home className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold truncate ${hasUnread ? "text-gray-900" : "text-gray-700"}`}>{thread.propertyTitle}</span>
                        {hasUnread && <span className="shrink-0 w-2 h-2 rounded-full bg-green-600" />}
                      </div>
                      {thread.ownerName && <p className="text-xs text-gray-500 mb-0.5">{thread.ownerName}</p>}
                      <p className={`text-sm truncate ${hasUnread ? "text-gray-800 font-medium" : "text-gray-500"}`}>{thread.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
                        {thread.userLabel && thread.userLabel !== "No Label" && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_COLORS[thread.userLabel] || "bg-gray-100 text-gray-600"}`}>{thread.userLabel}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-gray-400">{timeAgo(thread.lastMessageAt || thread.createdAt)}</span>
                      {hasUnread && <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-semibold">{thread.unreadByUser > 9 ? "9+" : thread.unreadByUser}</span>}
                      <div className="flex items-center gap-1 mt-auto">
                        {tab !== "deleted" && (
                          <button onClick={(e) => handleDelete(thread.id, e)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
