// components/dashboard/OwnerDashboard/InquiryInbox.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Search, Inbox, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import UserAvatar from "@/components/common/UserAvatar";
import { timeAgoShort } from "@/lib/inquiries/inquiryDisplay";

interface InquiryThread {
  id: string;
  propertyTitle: string;
  guestName: string;
  guestAvatar?: string | null;
  lastMessage: string;
  lastMessageAt: string | null;
  lastMessageRole: string;
  status: string;
  unreadByOwner: number;
  ownerLabel: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW:       { label: "New",       color: "bg-blue-100 text-blue-800" },
  READ:      { label: "Read",      color: "bg-gray-100 text-gray-700" },
  REPLIED:   { label: "Replied",   color: "bg-green-100 text-green-800" },
  CONVERTED: { label: "Converted", color: "bg-indigo-100 text-indigo-800" },
  CLOSED:    { label: "Closed",    color: "bg-gray-200 text-gray-600" },
};

const LABEL_COLORS: Record<string, string> = {
  "Viewing arranged":      "bg-blue-100 text-blue-700",
  "Viewing completed":     "bg-green-100 text-green-700",
  "Suitable":              "bg-emerald-100 text-emerald-700",
  "Maybe":                 "bg-yellow-100 text-yellow-700",
  "Rejected":              "bg-red-100 text-red-700",
  "Waiting for paperwork": "bg-purple-100 text-purple-700",
};

function timeAgo(dateStr: string | null) {
  return timeAgoShort(dateStr);
}

export default function InquiryInbox() {
  const [threads, setThreads] = useState<InquiryThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/inquiries?forOwner=true&pageSize=100&tab=all");
      if (res.data?.success) {
        setThreads(
          (res.data.data?.items || []).map((inq: any) => ({
            id: inq.id,
            propertyTitle: inq.propertyTitle || "Property",
            guestName: inq.guestName || "Guest",
            guestAvatar: inq.guestAvatar || null,
            lastMessage: inq.lastMessage || inq.message || "",
            lastMessageAt: inq.lastMessageAt || inq.updatedAt || inq.createdAt,
            lastMessageRole: inq.lastMessageRole || "USER",
            status: (inq.status || "NEW").toUpperCase(),
            unreadByOwner: inq.unreadByOwner || 0,
            ownerLabel: inq.ownerLabel || null,
            createdAt: inq.createdAt,
          }))
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const filtered = threads.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.guestName.toLowerCase().includes(q) || t.propertyTitle.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q);
  });

  const unreadCount = threads.filter((t) => t.unreadByOwner > 0).length;
  const notRepliedCount = threads.filter((t) => t.lastMessageRole !== "OWNER" && t.status !== "CLOSED").length;

  return (
    <div className="bg-white rounded-[5px] shadow-sm border">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Inbox className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inquiry Inbox</h3>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-sm text-gray-500">{threads.length} total</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">{unreadCount} unread</span>
              )}
              {notRepliedCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{notRepliedCount} not replied</span>
              )}
            </div>
          </div>
        </div>
        <Link href="/owner/dashboard/inquiries" className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium shrink-0">
          View All <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, property or message..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Thread list */}
      <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{threads.length === 0 ? "No inquiries yet." : "No results found."}</p>
          </div>
        ) : (
          filtered.map((thread) => {
            const statusCfg = STATUS_CONFIG[thread.status] || STATUS_CONFIG.NEW;
            const hasUnread = thread.unreadByOwner > 0;
            return (
              <div key={thread.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${hasUnread ? "bg-green-50/40 border-l-4 border-l-green-500" : ""}`}>
                <UserAvatar
                  name={thread.guestName}
                  src={thread.guestAvatar}
                  size="sm"
                  ring={hasUnread}
                  className="mt-0.5"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-semibold truncate ${hasUnread ? "text-gray-900" : "text-gray-700"}`}>{thread.guestName}</span>
                    {hasUnread && (
                      <span className="text-xs bg-green-600 text-white rounded-full px-1.5 py-0.5 font-semibold shrink-0">{thread.unreadByOwner}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    <span className="font-semibold text-gray-700">{thread.propertyTitle}</span>
                  </p>
                  <p className={`text-sm truncate ${hasUnread ? "text-gray-800 font-medium" : "text-gray-500"}`}>{thread.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
                    {thread.ownerLabel && thread.ownerLabel !== "No Label" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_COLORS[thread.ownerLabel] || "bg-gray-100 text-gray-600"}`}>{thread.ownerLabel}</span>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs whitespace-nowrap ${hasUnread ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                    {timeAgo(thread.lastMessageAt || thread.createdAt)}
                  </span>
                  <Link
                    href={`/owner/dashboard/inquiries/${thread.id}?from=dashboard`}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium border border-green-200 hover:border-green-400 rounded px-2 py-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Show Chat
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}