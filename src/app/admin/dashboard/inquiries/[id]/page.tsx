"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import {
  ArrowLeft, Send, Home, Tag, X, CheckCircle,
  Bell, ChevronDown, StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["NEW", "READ", "REPLIED", "CONVERTED", "CLOSED"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW:       { label: "New",       color: "text-blue-600 bg-blue-50 border-blue-200" },
  READ:      { label: "Read",      color: "text-gray-600 bg-gray-50 border-gray-200" },
  REPLIED:   { label: "Replied",   color: "text-green-600 bg-green-50 border-green-200" },
  CONVERTED: { label: "Converted", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  CLOSED:    { label: "Closed",    color: "text-gray-500 bg-gray-100 border-gray-200" },
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

interface Reminder {
  id: string;
  title: string;
  scheduledAt: string;
  note: string | null;
  isCompleted: boolean;
}

interface InquiryDetail {
  id: string;
  propertyId: string;
  propertyTitle: string;
  status: string;
  type: string;
  createdAt: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  message: string;
  ownerName?: string;
  ownerEmail?: string;
}

export default function AdminInquiryChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: inquiryId } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [note, setNote] = useState("");
  const [loadingInquiry, setLoadingInquiry] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string>("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const noteDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    api.get("/auth/me").then((r) => {
      if (r.data?.data?.id) setCurrentUserId(r.data.data.id);
    }).catch(() => {});
  }, []);

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
          createdAt: d.createdAt,
          guestName: d.guestName,
          guestEmail: d.guestEmail,
          guestPhone: d.guestPhone,
          message: d.message,
          ownerName: d.ownerName,
          ownerEmail: d.ownerEmail,
        });
      }

      if (msgRes.data?.success && msgRes.data.data) {
        const msgs = msgRes.data.data as Message[];
        setMessages(msgs);
        if (msgs.length > 0) lastMsgIdRef.current = msgs[msgs.length - 1].id;
      }
    } catch (err) {
      console.error("Error loading inquiry:", err);
    } finally {
      setLoadingInquiry(false);
    }
  }, [inquiryId]);

  // Load private note
  const loadNote = useCallback(async () => {
    try {
      const res = await api.get(`/inquiries/${inquiryId}/notes`);
      if (res.data?.success && res.data.data?.content) setNote(res.data.data.content);
    } catch {
      // silent
    }
  }, [inquiryId]);

  useEffect(() => {
    loadInquiry();
  }, [loadInquiry]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      }
    } catch {
      // silent
    }
  }, [inquiryId]);

  useEffect(() => {
    pollRef.current = setInterval(pollMessages, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollMessages]);

  const loadReminders = useCallback(async () => {
    try {
      const res = await api.get(`/inquiries/${inquiryId}/reminders`);
      if (res.data?.success && res.data.data) setReminders(res.data.data);
    } catch {
      // silent
    }
  }, [inquiryId]);

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

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/inquiries/${inquiryId}`, { status });
      setInquiry((prev) => prev ? { ...prev, status } : prev);
      setShowStatusMenu(false);
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

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

  const handleAddReminder = async () => {
    if (!reminderTitle || !reminderDate) return;
    setSavingReminder(true);
    try {
      const res = await api.post(`/inquiries/${inquiryId}/reminders`, {
        title: reminderTitle,
        scheduledAt: new Date(reminderDate).toISOString(),
        note: reminderNote || undefined,
        remindOwner: true,
        remindAdmin: true,
      });
      if (res.data?.success && res.data.data) {
        setReminders((prev) => [...prev, res.data.data]);
      }
      setReminderTitle("");
      setReminderDate("");
      setReminderNote("");
      setShowReminderForm(false);
      toast({ title: "Reminder set" });
    } catch {
      toast({ title: "Error", description: "Failed to save reminder", variant: "destructive" });
    } finally {
      setSavingReminder(false);
    }
  };

  if (loadingInquiry) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!inquiry) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-16">
          <p className="text-gray-500">Inquiry not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </div>
      </AdminDashboardLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.NEW;

  return (
    <AdminDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard/inquiries")} className="p-2 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 truncate">{inquiry.guestName}</h1>
              <span className="text-sm text-gray-500">→</span>
              <span className="text-sm text-gray-600 truncate">{inquiry.propertyTitle}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-500">
              <span>{inquiry.guestEmail}</span>
              {inquiry.guestPhone && <><span className="text-gray-300">·</span><span>{inquiry.guestPhone}</span></>}
              {inquiry.ownerName && <><span className="text-gray-300">·</span><span>Owner: {inquiry.ownerName}</span></>}
              <span className="text-gray-300">·</span>
              <Link href={`/property/${inquiry.propertyId}`} className="text-green-600 hover:underline flex items-center gap-1">
                <Home className="w-3 h-3" /> View Property
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Status */}
            <div className="relative">
              <button
                onClick={() => { setShowStatusMenu((v) => !v); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium ${statusCfg.color}`}
              >
                {statusCfg.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border rounded-[5px] shadow-lg z-20 py-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${inquiry.status === s ? "font-semibold" : ""}`}
                    >
                      {STATUS_CONFIG[s]?.label || s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Note */}
            <button
              onClick={() => { setShowNotePanel((v) => !v); if (!showNotePanel) loadNote(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50"
            >
              <StickyNote className="w-3 h-3" />
              Notes
            </button>

            {/* Reminders */}
            <button
              onClick={() => { setShowReminders((v) => !v); if (!showReminders) loadReminders(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50"
            >
              <Bell className="w-3 h-3" />
              Reminders
              {reminders.filter((r) => !r.isCompleted).length > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                  {reminders.filter((r) => !r.isCompleted).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Note panel */}
        {showNotePanel && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-[5px] p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-yellow-900 flex items-center gap-2">
                <StickyNote className="w-4 h-4" /> Private Note
                {savingNote && <span className="text-xs text-yellow-600 font-normal">Saving…</span>}
              </h3>
              <button onClick={() => setShowNotePanel(false)}><X className="w-3.5 h-3.5 text-yellow-600" /></button>
            </div>
            <Textarea
              placeholder="Add a private note about this inquiry (only visible to admin)..."
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              className="text-sm resize-none min-h-[80px] bg-white border-yellow-200"
            />
            <p className="text-xs text-yellow-700 mt-1">Notes are private and auto-saved.</p>
          </div>
        )}

        {/* Reminders panel */}
        {showReminders && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-[5px] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                <Bell className="w-4 h-4" /> Reminders
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReminderForm((v) => !v)}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                >
                  + Add Reminder
                </button>
                <button onClick={() => setShowReminders(false)}><X className="w-3.5 h-3.5 text-amber-600" /></button>
              </div>
            </div>

            {showReminderForm && (
              <div className="mb-3 p-3 bg-white rounded border border-amber-200 space-y-2">
                <Input
                  placeholder="Reminder title"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="text-sm h-8"
                />
                <Input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="text-sm h-8"
                />
                <Textarea
                  placeholder="Optional note..."
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  className="text-sm resize-none min-h-[48px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddReminder} disabled={!reminderTitle || !reminderDate || savingReminder}
                    className="bg-amber-600 hover:bg-amber-700 h-7 text-xs">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReminderForm(false)} className="h-7 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {reminders.length === 0 ? (
              <p className="text-xs text-amber-700">No reminders yet.</p>
            ) : (
              <div className="space-y-2">
                {reminders.map((r) => (
                  <div key={r.id} className={`flex items-start gap-2 p-2 rounded border bg-white ${r.isCompleted ? "opacity-50" : ""}`}>
                    <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${r.isCompleted ? "text-green-500" : "text-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-500">{new Date(r.scheduledAt).toLocaleString("en-GB")}</p>
                      {r.note && <p className="text-xs text-gray-400 mt-0.5">{r.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat area */}
        <div className="bg-white rounded-[5px] border flex flex-col" style={{ height: "calc(100vh - 260px)", minHeight: "460px" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Original inquiry bubble from USER */}
            <div className="flex justify-start">
              <div className="max-w-[75%]">
                <div className="bg-gray-100 text-gray-900 rounded-[5px] rounded-bl-none px-4 py-3">
                  <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">{inquiry.guestName} · {formatTime(inquiry.createdAt)}</span>
                </div>
              </div>
            </div>

            {messages.map((msg) => {
              const isAdmin = msg.senderRole === "ADMIN";
              const isOwner = msg.senderRole === "OWNER";
              const isSystem = msg.senderRole === "SYSTEM" || msg.messageType === "STATUS_CHANGE";

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                );
              }

              const isMe = isAdmin;
              const bubbleColor = isAdmin
                ? "bg-green-600 text-white rounded-br-none"
                : isOwner
                  ? "bg-blue-100 text-blue-900 rounded-bl-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none";

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%]">
                    <div className={`rounded-[5px] px-4 py-3 ${bubbleColor}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className="text-xs text-gray-400">
                        {isMe ? "Admin (You)" : `${msg.senderName} (${msg.senderRole})`} · {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {inquiry.status === "CLOSED" ? (
            <div className="border-t px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
              This inquiry is closed.
            </div>
          ) : (
            <div className="border-t px-4 py-3 flex gap-3 items-end bg-white">
              <Textarea
                placeholder="Type admin reply... (Enter to send, Shift+Enter for new line)"
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
      </div>
    </AdminDashboardLayout>
  );
}
