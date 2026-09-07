"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import {
  ArrowLeft, Home, X, CheckCircle, Bell, ChevronDown,
  StickyNote, User, Mail, Phone, Building, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["NEW", "READ", "REPLIED", "CONVERTED", "CLOSED"];

const LABELS: { value: string; label: string; color: string }[] = [
  { value: "hot_lead",   label: "Hot Lead",    color: "text-red-600 bg-red-50 border-red-200" },
  { value: "follow_up",  label: "Follow Up",   color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "interested", label: "Interested",  color: "text-green-600 bg-green-50 border-green-200" },
  { value: "not_serious",label: "Not Serious", color: "text-gray-500 bg-gray-100 border-gray-200" },
  { value: "closed_won", label: "Closed Won",  color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { value: "closed_lost",label: "Closed Lost", color: "text-gray-400 bg-gray-50 border-gray-200" },
];

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
  return (
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
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
  ownerPhone?: string;
  ownerId?: string;
  fullAdminSupport?: boolean;
  ownerLabel?: string | null;
}

export default function AdminInquiryChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: inquiryId } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [note, setNote] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingInquiry, setLoadingInquiry] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTenantPanel, setShowTenantPanel] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [savingLabel, setSavingLabel] = useState(false);
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
          guestEmail: d.guestEmail || d.email,
          guestPhone: d.guestPhone || d.phone,
          message: d.message,
          ownerName: d.ownerName,
          ownerEmail: d.ownerEmail,
          ownerPhone: d.ownerPhone,
          ownerId: d.ownerId,
          fullAdminSupport: d.fullAdminSupport ?? false,
          ownerLabel: d.ownerLabel ?? null,
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

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

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

  const handleStatusChange = async (status: string) => {
    setChangingStatus(true);
    try {
      await api.patch(`/inquiries/${inquiryId}`, { status });
      setInquiry((prev) => (prev ? { ...prev, status } : prev));
      setShowStatusMenu(false);
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setChangingStatus(false);
    }
  };

  const handleSetLabel = async (value: string | null) => {
    setSavingLabel(true);
    try {
      await api.patch(`/inquiries/${inquiryId}`, { ownerLabel: value });
      setInquiry((prev) => (prev ? { ...prev, ownerLabel: value } : prev));
      setShowLabelMenu(false);
      toast({ title: value ? "Label applied" : "Label cleared" });
    } catch {
      toast({ title: "Error", description: "Failed to set label", variant: "destructive" });
    } finally {
      setSavingLabel(false);
    }
  };

  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/inquiries/${inquiryId}/messages`, { content });
      if (res.data?.success && res.data.data) {
        setMessages((prev) => [...prev, res.data.data]);
        lastMsgIdRef.current = res.data.data.id;
      }
      setNewMessage("");
      // Update status to REPLIED if currently NEW/READ
      if (inquiry && (inquiry.status === "NEW" || inquiry.status === "READ")) {
        await api.patch(`/inquiries/${inquiryId}`, { status: "REPLIED" });
        setInquiry((prev) => (prev ? { ...prev, status: "REPLIED" } : prev));
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
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
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </AdminDashboardLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.NEW;
  const isFullSupport = inquiry.fullAdminSupport === true;

  return (
    <AdminDashboardLayout>
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/dashboard/inquiries")}
            className="p-2 mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{inquiry.propertyTitle}</h1>
            <Link
              href={`/property/${inquiry.propertyId}`}
              className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-0.5"
            >
              <Home className="w-3 h-3" /> View Property
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Mode badge */}
            {isFullSupport ? (
              <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded font-medium">
                Admin Support &middot; Full Access
              </span>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded font-medium">
                Admin View &middot; Read Only
              </span>
            )}

            {/* Status */}
            <div className="relative">
              <button
                onClick={() => { if (!changingStatus) setShowStatusMenu((v) => !v); }}
                disabled={changingStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium ${statusCfg.color} disabled:opacity-60`}
              >
                {changingStatus ? (
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                {statusCfg.label}
                {!changingStatus && <ChevronDown className="w-3 h-3" />}
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

            {/* Owner Details */}
            <button
              onClick={() => { setShowOwnerPanel(true); setShowTenantPanel(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
            >
              <Building className="w-3 h-3" />
              Owner Details
            </button>

            {/* Label */}
            <div className="relative">
              <button
                onClick={() => { if (!savingLabel) setShowLabelMenu((v) => !v); }}
                disabled={savingLabel}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium disabled:opacity-60 ${
                  inquiry.ownerLabel
                    ? (LABELS.find((l) => l.value === inquiry.ownerLabel)?.color ?? "text-gray-600 bg-white border-gray-200")
                    : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {savingLabel ? (
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                {inquiry.ownerLabel
                  ? (LABELS.find((l) => l.value === inquiry.ownerLabel)?.label ?? inquiry.ownerLabel)
                  : "Set Label"}
                {!savingLabel && <ChevronDown className="w-3 h-3" />}
              </button>
              {showLabelMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white border rounded-[5px] shadow-lg z-20 py-1">
                  {LABELS.map((lbl) => (
                    <button
                      key={lbl.value}
                      onClick={() => handleSetLabel(lbl.value)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                        inquiry.ownerLabel === lbl.value ? "font-semibold" : ""
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded border ${lbl.color}`}>{lbl.label}</span>
                    </button>
                  ))}
                  {inquiry.ownerLabel && (
                    <>
                      <div className="border-t my-1" />
                      <button
                        onClick={() => handleSetLabel(null)}
                        className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50"
                      >
                        Clear label
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Tenant Details */}
            <button
              onClick={() => { setShowTenantPanel(true); setShowOwnerPanel(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50"
            >
              <User className="w-3 h-3" />
              Tenant Details
            </button>

            {/* Reminders */}
            <button
              onClick={() => setShowReminders((v) => !v)}
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

            {/* Notes */}
            <button
              onClick={() => { setShowNoteModal(true); loadNote(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium text-gray-600 bg-white border-gray-200 hover:bg-gray-50"
            >
              <StickyNote className="w-3 h-3" />
              Notes
            </button>
          </div>
        </div>

        {/* Owner Details Slide-over */}
        {showOwnerPanel && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowOwnerPanel(false)}>
            <div
              className="bg-white w-full max-w-sm h-full shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900">Owner Details</h3>
                <button onClick={() => setShowOwnerPanel(false)}>
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-lg font-bold text-blue-700">
                    {(inquiry.ownerName || "O").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{inquiry.ownerName || "Unknown Owner"}</p>
                    <p className="text-xs text-gray-500">Property Owner</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[5px] border">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      {inquiry.ownerEmail ? (
                        <a href={`mailto:${inquiry.ownerEmail}`} className="text-sm text-green-600 hover:underline truncate block">
                          {inquiry.ownerEmail}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">Not available</p>
                      )}
                    </div>
                  </div>
                  {inquiry.ownerPhone ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[5px] border">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <a href={`tel:${inquiry.ownerPhone}`} className="text-sm text-green-600 hover:underline">
                          {inquiry.ownerPhone}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[5px] border">
                      <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <p className="text-sm text-gray-400">Not provided</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Property</p>
                  <p className="text-sm font-medium text-gray-700">{inquiry.propertyTitle}</p>
                  <Link
                    href={`/property/${inquiry.propertyId}`}
                    className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-2"
                  >
                    <Home className="w-3 h-3" /> View Property
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tenant Details Slide-over */}
        {showTenantPanel && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowTenantPanel(false)}>
            <div
              className="bg-white w-full max-w-sm h-full shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900">Tenant Details</h3>
                <button onClick={() => setShowTenantPanel(false)}>
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-lg font-bold text-green-700">
                    {inquiry.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{inquiry.guestName}</p>
                    <p className="text-xs text-gray-500">Prospective Tenant</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[5px] border">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <a href={`mailto:${inquiry.guestEmail}`} className="text-sm text-green-600 hover:underline truncate block">
                        {inquiry.guestEmail}
                      </a>
                    </div>
                  </div>
                  {inquiry.guestPhone ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[5px] border">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <a href={`tel:${inquiry.guestPhone}`} className="text-sm text-green-600 hover:underline">
                          {inquiry.guestPhone}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[5px] border">
                      <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <p className="text-sm text-gray-400">Not provided</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Inquiry Info</p>
                  <p className="text-xs text-gray-500">
                    Property: <span className="font-medium text-gray-700">{inquiry.propertyTitle}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started:{" "}
                    <span className="font-medium text-gray-700">
                      {new Date(inquiry.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[5px] shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" /> Admin Notes
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Private notes &mdash; only visible to admins.</p>
                </div>
                <button onClick={() => setShowNoteModal(false)}>
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="p-4">
                <Textarea
                  placeholder="Write a private note..."
                  value={note}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  className="resize-none min-h-30 text-sm"
                />
                {savingNote && <p className="text-xs text-gray-400 mt-1">Saving...</p>}
              </div>
            </div>
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
                <button onClick={() => setShowReminders(false)}>
                  <X className="w-3.5 h-3.5 text-amber-600" />
                </button>
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
                  className="text-sm resize-none min-h-12"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddReminder}
                    disabled={!reminderTitle || !reminderDate || savingReminder}
                    className="bg-amber-600 hover:bg-amber-700 h-7 text-xs"
                  >
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
        <div
          className="bg-white rounded-[5px] border flex flex-col"
          style={{ height: "calc(100vh - 260px)", minHeight: "460px" }}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Fallback only when chat messages do not already include the inquiry text */}
            {inquiry.message &&
              !messages.some(
                (m) =>
                  m.senderRole === "USER" &&
                  m.messageType === "TEXT" &&
                  m.content.trim() === inquiry.message.trim()
              ) && (
              <div className="flex justify-start">
                <div className="max-w-[75%]">
                  <div className="bg-gray-100 text-gray-900 rounded-[5px] rounded-bl-none px-4 py-3">
                    <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">
                      {inquiry.guestName} &middot; {formatTime(inquiry.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isOwner = msg.senderRole === "OWNER";
              const isSystem = msg.senderRole === "SYSTEM" || msg.messageType === "STATUS_CHANGE";

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const bubbleColor = isOwner
                ? "bg-green-600 text-white rounded-br-none"
                : "bg-gray-100 text-gray-900 rounded-bl-none";

              return (
                <div key={msg.id} className={`flex ${isOwner ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%]">
                    <div className={`rounded-[5px] px-4 py-3 ${bubbleColor}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isOwner ? "justify-end" : "justify-start"}`}>
                      <span className="text-xs text-gray-400">
                        {msg.senderName} &middot; {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer: send box (full support) or read-only notice */}
          {isFullSupport ? (
            <div className="border-t p-3 bg-white">
              <div className="flex gap-2 items-end">
                <Textarea
                  placeholder="Type a message to the tenant..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 resize-none text-sm min-h-11 max-h-32"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-green-600 hover:bg-green-700 h-11 px-4 shrink-0"
                >
                  {sending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Replying as admin on behalf of owner &middot; Press Enter to send
              </p>
            </div>
          ) : (
            <div className="border-t px-4 py-3 bg-amber-50 text-center text-xs text-amber-700 font-medium">
              Admin view &mdash; This conversation is read-only. Messages are between the owner and tenant.
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
