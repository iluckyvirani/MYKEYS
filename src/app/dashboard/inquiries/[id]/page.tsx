"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  ArrowLeft, Send, Home, Tag, X, CheckCircle,
  Archive, MailOpen, Clock, StickyNote, User, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const LABELS = [
  "No Label",
  "Viewing arranged",
  "Viewing completed",
  "Suitable",
  "Maybe",
  "Rejected",
  "Waiting for paperwork",
];

const LABEL_COLORS: Record<string, string> = {
  "Viewing arranged":      "bg-blue-100 text-blue-700 border-blue-200",
  "Viewing completed":     "bg-green-100 text-green-700 border-green-200",
  "Suitable":              "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Maybe":                 "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Rejected":              "bg-red-100 text-red-700 border-red-200",
  "Waiting for paperwork": "bg-purple-100 text-purple-700 border-purple-200",
  "No Label":              "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  NEW:       { label: "New",       icon: MailOpen,    color: "text-blue-600 bg-blue-50" },
  READ:      { label: "Read",      icon: Clock,       color: "text-gray-600 bg-gray-50" },
  REPLIED:   { label: "Replied",   icon: CheckCircle, color: "text-green-600 bg-green-50" },
  CONVERTED: { label: "Converted", icon: CheckCircle, color: "text-indigo-600 bg-indigo-50" },
  CLOSED:    { label: "Closed",    icon: Archive,     color: "text-gray-500 bg-gray-100" },
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

interface Message {
  id: string;
  content: string;
  messageType: string;
  senderRole: string;
  senderId: string | null;
  senderName: string;
  senderAvatar: string | null;
  readBy: string[];
  createdAt: string;
}

interface InquiryDetail {
  id: string;
  propertyId: string;
  propertyTitle: string;
  status: string;
  type: string;
  userLabel: string | null;
  unreadByUser: number;
  createdAt: string;
  guestName: string;
  guestEmail: string;
  message: string;
  ownerName?: string;
  ownerAvatar?: string | null;
  ownerId?: string;
}

interface OwnerProperty {
  id: string;
  title: string;
  listingType: string;
  price: number;
}

export default function UserChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: inquiryId } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingInquiry, setLoadingInquiry] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [changingLabel, setChangingLabel] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [ownerProperties, setOwnerProperties] = useState<OwnerProperty[]>([]);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string>("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const noteDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch current user id
  useEffect(() => {
    api.get("/auth/me").then((r) => {
      if (r.data?.data?.id) setCurrentUserId(r.data.data.id);
    }).catch(() => {});
  }, []);

  // Fetch inquiry detail + messages on mount
  const loadInquiry = useCallback(async () => {
    try {
      const [inqRes, msgRes] = await Promise.all([
        api.get(`/inquiries/${inquiryId}`),
        api.get(`/inquiries/${inquiryId}/messages`),
      ]);

      if (inqRes.data?.success && inqRes.data.data) {
        const d = inqRes.data.data;
        setInquiry({
          id: d.id,
          propertyId: d.propertyId,
          propertyTitle: d.propertyTitle,
          status: d.status,
          type: d.type,
          userLabel: d.userLabel || null,
          unreadByUser: d.unreadByUser || 0,
          createdAt: d.createdAt,
          guestName: d.guestName,
          guestEmail: d.guestEmail,
          message: d.message,
          ownerName: d.ownerName,
          ownerAvatar: d.ownerAvatar || null,
          ownerId: d.ownerId || null,
        });
      }

      if (msgRes.data?.success && msgRes.data.data) {
        const msgs = msgRes.data.data as Message[];
        setMessages(msgs);
        if (msgs.length > 0) lastMsgIdRef.current = msgs[msgs.length - 1].id;
      }

      // Mark as read
      await api.patch(`/inquiries/${inquiryId}/read`);
    } catch (err) {
      console.error("Error loading inquiry:", err);
    } finally {
      setLoadingInquiry(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    loadInquiry();
  }, [loadInquiry]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 10 seconds
  const pollMessages = useCallback(async () => {
    try {
      const url = lastMsgIdRef.current
        ? `/inquiries/${inquiryId}/messages?after=${lastMsgIdRef.current}`
        : `/inquiries/${inquiryId}/messages`;
      const res = await api.get(url);
      if (res.data?.success && res.data.data?.length > 0) {
        const newMsgs = res.data.data as Message[];
        setMessages((prev) => [...prev, ...newMsgs]);
        lastMsgIdRef.current = newMsgs[newMsgs.length - 1].id;
        // Mark as read
        await api.patch(`/inquiries/${inquiryId}/read`);
      }
    } catch {
      // Silent
    }
  }, [inquiryId]);

  useEffect(() => {
    pollRef.current = setInterval(pollMessages, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollMessages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/inquiries/${inquiryId}/messages`, { content });
      if (res.data?.success && res.data.data) {
        const newMsg = res.data.data as Message;
        setMessages((prev) => [...prev, newMsg]);
        lastMsgIdRef.current = newMsg.id;
        setText("");
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadNote = useCallback(async () => {
    try {
      const res = await api.get(`/inquiries/${inquiryId}/notes`);
      if (res.data?.success && res.data.data?.content) setNote(res.data.data.content);
    } catch {
      // silent
    }
  }, [inquiryId]);

  const handleNoteChange = (val: string) => {
    setNote(val);
    if (noteDebounceRef.current) clearTimeout(noteDebounceRef.current);
    noteDebounceRef.current = setTimeout(async () => {
      setSavingNote(true);
      try {
        await api.post(`/inquiries/${inquiryId}/notes`, { content: val });
      } catch {
        // silent
      } finally {
        setSavingNote(false);
      }
    }, 800);
  };

  const handleLabelChange = async (label: string) => {
    setChangingLabel(true);
    try {
      const payload = label === "No Label" ? { label: null } : { label };
      await api.patch(`/inquiries/${inquiryId}/label`, payload);
      setInquiry((prev) => prev ? { ...prev, userLabel: label === "No Label" ? null : label } : prev);
      setShowLabelMenu(false);
      toast({ title: "Label updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update label", variant: "destructive" });
    } finally {
      setChangingLabel(false);
    }
  };

  if (loadingInquiry) {
    return (
      <DashboardLayout defaultRole="user">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!inquiry) {
    return (
      <DashboardLayout defaultRole="user">
        <div className="text-center py-16">
          <p className="text-gray-500">Inquiry not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.NEW;
  const StatusIcon = statusCfg.icon;
  const currentLabel = inquiry.userLabel || "No Label";

  return (
    <DashboardLayout defaultRole="user">
      {/* Back + Header */}
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/user/dashboard/inquiries")} className="p-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900 truncate">{inquiry.propertyTitle}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Link href={`/property/${inquiry.propertyId}`} className="text-xs text-green-600 hover:underline flex items-center gap-1">
              <Home className="w-3 h-3" /> View Property
            </Link>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">
              Started {new Date(inquiry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Note button */}
        <button
          onClick={() => { setShowNoteModal(true); loadNote(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50 shrink-0 cursor-pointer"
        >
          <StickyNote className="w-3 h-3" />
          Notes
        </button>

        {/* View Owner Details button */}
        {inquiry?.ownerName && (
          <button
            onClick={async () => {
              setShowOwnerPanel(true);
              if (ownerProperties.length === 0 && inquiry.ownerId) {
                setLoadingOwner(true);
                try {
                  const res = await api.get(`/properties?ownerId=${inquiry.ownerId}&status=ACTIVE&pageSize=5`);
                  setOwnerProperties(res.data?.data?.items || []);
                } catch {}
                setLoadingOwner(false);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50 shrink-0 cursor-pointer"
          >
            <User className="w-3 h-3" />
            View Owner
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Label picker */}
        <div className="relative shrink-0">
          <button
            onClick={() => { if (!changingLabel) setShowLabelMenu((v) => !v); }}
            disabled={changingLabel}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 ${LABEL_COLORS[currentLabel]}`}
          >
            {changingLabel ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <Tag className="w-3 h-3" />}
            {currentLabel}
          </button>
          {showLabelMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-white border rounded-[5px] shadow-lg z-20 py-1">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Label</span>
                <button onClick={() => setShowLabelMenu(false)}><X className="w-3 h-3 text-gray-400" /></button>
              </div>
              {LABELS.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLabelChange(l)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${currentLabel === l ? "font-semibold" : ""}`}
                >
                  <span className={`w-2 h-2 rounded-full border ${LABEL_COLORS[l] || "bg-gray-200"}`} />
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[5px] shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <StickyNote className="w-4 h-4" /> Add notes
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">All notes are saved automatically. Only you can see them.</p>
              </div>
              <button onClick={() => setShowNoteModal(false)}><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-4">
              <Textarea
                placeholder="Write a private note..."
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                className="resize-none min-h-[120px] text-sm"
              />
              {savingNote && <p className="text-xs text-gray-400 mt-1">Saving...</p>}
            </div>
          </div>
        </div>
      )}

      {/* Owner Details slide-over */}
      {showOwnerPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowOwnerPanel(false)}>
          <div className="bg-white w-full max-w-sm h-full shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Owner Details</h3>
              <button onClick={() => setShowOwnerPanel(false)}><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-4 space-y-5">
              {/* Owner info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {inquiry?.ownerAvatar ? (
                    <img src={inquiry.ownerAvatar} alt={inquiry.ownerName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{inquiry?.ownerName}</p>
                  <p className="text-xs text-gray-500">Property Owner</p>
                </div>
              </div>
              {/* Other active listings */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Other listings from {inquiry?.ownerName?.split(" ")[0]}
                </h4>
                {loadingOwner ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400" /> Loading...</div>
                ) : ownerProperties.length === 0 ? (
                  <p className="text-sm text-gray-400">No other active listings found.</p>
                ) : (
                  <ul className="space-y-2">
                    {ownerProperties.map((p) => (
                      <li key={p.id}>
                        <Link href={`/property/${p.id}`} className="flex items-center justify-between p-2 rounded-[5px] border hover:bg-gray-50 text-sm">
                          <span className="truncate text-gray-900">{p.title}</span>
                          <span className="text-xs text-green-600 shrink-0 ml-2">{formatCurrency(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="bg-white rounded-[5px] border flex flex-col" style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Fallback for older inquiries that never got a seeded chat message */}
          {inquiry.message &&
            !messages.some(
              (m) =>
                m.senderRole === "USER" &&
                m.messageType === "TEXT" &&
                m.content.trim() === inquiry.message.trim()
            ) && (
              <div className="flex justify-end">
                <div className="max-w-[75%]">
                  <div className="bg-green-600 text-white rounded-[5px] rounded-br-none px-4 py-3">
                    <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs text-gray-400">You · {formatTime(inquiry.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId || msg.senderRole === "USER";
            const isSystem = msg.senderRole === "SYSTEM" || msg.messageType === "STATUS_CHANGE";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.content}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  <div className={`rounded-[5px] px-4 py-3 ${isMe ? "bg-green-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-xs text-gray-400">
                      {isMe ? "You" : msg.senderName} · {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {inquiry.status === "CLOSED" ? (
          <div className="border-t px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
            This inquiry is closed.
          </div>
        ) : (
          <div className="border-t px-4 py-3 flex gap-3 items-end bg-white">
            <Textarea
              placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[48px] max-h-32 flex-1 text-sm"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 h-12 shrink-0 rounded-[5px]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
