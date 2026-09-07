// app/service/dashboard/bookings/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Clock, User, MapPin, Phone,
  CheckCircle, XCircle, PlayCircle, Flag, Star,
  Download, ChevronDown, ChevronUp, Loader2, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ServiceReviewsModal, { ServiceReview } from "@/components/services/ServiceReviewsModal";

interface ServiceBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  amount: number;
  description: string;
  paymentStatus: string;
  bookingType?: "instant" | "scheduled";
  pendingAction?: "COMPLETE" | "CANCEL" | null;
  createdAt: string;
  reviewRating?: number | null;
  reviewComment?: string | null;
  reviewResponse?: string | null;
}

type StatusKey = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

const STATUS_META: Record<StatusKey, { label: string; color: string; bg: string; dot: string }> = {
  pending:       { label: "Pending",     color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200",  dot: "bg-yellow-400" },
  confirmed:     { label: "Confirmed",   color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",      dot: "bg-blue-500"   },
  "in-progress": { label: "In Progress", color: "text-purple-700", bg: "bg-purple-50 border-purple-200",  dot: "bg-purple-500" },
  completed:     { label: "Completed",   color: "text-green-700",  bg: "bg-green-50 border-green-200",    dot: "bg-green-500"  },
  cancelled:     { label: "Cancelled",   color: "text-red-700",    bg: "bg-red-50 border-red-200",        dot: "bg-red-400"    },
};

export default function ServiceBookingsPage() {
  const { toast } = useToast();
  const [allBookings, setAllBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | StatusKey>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<ServiceReview[] | null>(null);
  const [reviewModalTitle, setReviewModalTitle] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/service/bookings?limit=100&sortBy=createdAt&sortOrder=desc");
      const items = res.data?.data?.items ?? res.data?.data ?? [];
      setAllBookings(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    try {
      const booking = allBookings.find((b) => b.id === id);
      const jobStarted =
        booking?.status === "confirmed" || booking?.status === "in-progress";

      // Complete always needs OTP. Cancel after accept/start also needs OTP
      // (unpaid pending decline can still cancel directly).
      if (status === "completed" || (status === "cancelled" && jobStarted)) {
        const action = status === "completed" ? "COMPLETE" : "CANCEL";
        const res = await api.post(`/service/bookings/${id}/request-action`, { action });
        const data = res.data?.data;
        setAllBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, pendingAction: action } : b))
        );
        toast({
          title: action === "CANCEL" ? "Cancel OTP sent to client" : "OTP sent to client",
          description: data?.clientEmailMasked
            ? `Ask the client to enter the code sent to ${data.clientEmailMasked}`
            : "Client must confirm with the email OTP",
        });
      } else {
        await api.patch(`/service/bookings/${id}`, { status });
        setAllBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: status as StatusKey } : b))
        );
        toast({ title: "Updated", description: `Booking marked as ${status}` });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const visibleBookings =
    activeTab === "all" ? allBookings : allBookings.filter((b) => b.status === activeTab);

  const countFor = (key: "all" | StatusKey) =>
    key === "all" ? allBookings.length : allBookings.filter((b) => b.status === key).length;

  const STAT_CARDS: { label: string; key: "all" | StatusKey; icon: any; iconClass: string; bg: string; border: string; activeBorder: string; activeText: string }[] = [
    { label: "All",         key: "all",         icon: Inbox,       iconClass: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-200",   activeBorder: "border-gray-500",   activeText: "text-gray-700"   },
    { label: "Pending",     key: "pending",     icon: Clock,       iconClass: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-100",  activeBorder: "border-yellow-400", activeText: "text-yellow-700" },
    { label: "Confirmed",   key: "confirmed",   icon: Calendar,    iconClass: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-100",   activeBorder: "border-blue-400",   activeText: "text-blue-700"   },
    { label: "In Progress", key: "in-progress", icon: PlayCircle,  iconClass: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100",  activeBorder: "border-purple-400", activeText: "text-purple-700" },
    { label: "Completed",   key: "completed",   icon: CheckCircle, iconClass: "text-green-500",  bg: "bg-green-50",  border: "border-green-100",  activeBorder: "border-green-400",  activeText: "text-green-700"  },
    { label: "Cancelled",   key: "cancelled",   icon: XCircle,     iconClass: "text-red-400",    bg: "bg-red-50",    border: "border-red-100",    activeBorder: "border-red-400",    activeText: "text-red-600"    },
  ];

  return (
    <DashboardLayout defaultRole="service">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Accept jobs, start work, then request complete/cancel — the client confirms with an email OTP.
        </p>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {STAT_CARDS.map(({ label, key, icon: Icon, iconClass, bg, border, activeBorder, activeText }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all cursor-pointer ${
              activeTab === key
                ? `${bg} ${activeBorder} shadow-sm`
                : `bg-white ${border} hover:shadow-sm`
            }`}
          >
            <Icon className={`w-5 h-5 ${activeTab === key ? iconClass : "text-gray-400"}`} />
            <span className={`text-xs font-semibold whitespace-nowrap ${activeTab === key ? activeText : "text-gray-500"}`}>
              {label}
            </span>
            <span className={`text-lg font-bold leading-none ${activeTab === key ? activeText : "text-gray-700"}`}>
              {countFor(key)}
            </span>
          </button>
        ))}
      </div>

      {/* Pending info banner */}
      {activeTab === "pending" && countFor("pending") > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
          <span className="font-semibold">Action needed:</span> Accept or decline new booking requests below.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No bookings here</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === "pending" ? "New requests from clients will appear here." : "Nothing to show for this status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleBookings.map((booking) => {
            const meta = STATUS_META[booking.status] ?? STATUS_META.pending;
            const isExpanded = expanded === booking.id;
            const isActing = (s: string) => actionLoading === booking.id + s;

            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Main row */}
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status + type badges */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      {booking.bookingType === "instant" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium border border-orange-200">⚡ Instant</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                    {booking.pendingAction && (
                      <p className="mt-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 inline-block">
                        {booking.pendingAction === "CANCEL"
                          ? "Cancel OTP sent — waiting for the client to confirm"
                          : "Complete OTP sent — waiting for the client to confirm"}
                      </p>
                    )}

                    {/* Info row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {booking.clientName}
                      </span>
                      {booking.clientPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {booking.clientPhone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {booking.date ? new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                      {booking.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.time}
                        </span>
                      )}
                      {booking.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + toggle */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-lg font-bold text-gray-900">£{Number(booking.amount).toLocaleString()}</p>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : booking.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mx-4 mb-3 space-y-2">
                    <div className="p-3 rounded-xl bg-gray-50 text-sm text-gray-600 space-y-1.5">
                      {booking.description && (
                        <p><span className="font-medium text-gray-700">Notes:</span> {booking.description}</p>
                      )}
                      {booking.clientEmail && (
                        <p><span className="font-medium text-gray-700">Email:</span> {booking.clientEmail}</p>
                      )}
                      <p>
                        <span className="font-medium text-gray-700">Payment:</span>{" "}
                        <span className={
                          (booking.paymentStatus === "paid" || booking.paymentStatus === "completed")
                            ? "text-green-600 font-medium" : "text-yellow-600"
                        }>
                          {booking.paymentStatus || "pending"}
                        </span>
                      </p>
                      {booking.createdAt && (
                        <p><span className="font-medium text-gray-700">Booked:</span> {new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                      )}
                    </div>

                    {/* Customer review — shown when completed and review exists */}
                    {booking.status === "completed" && booking.reviewRating && (
                      <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                        <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">Customer Review</p>
                        <div className="flex items-center gap-1 mb-1.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= (booking.reviewRating ?? 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm font-bold text-gray-800 ml-1">{booking.reviewRating}.0</span>
                        </div>
                        {booking.reviewComment && (
                          <p className="text-sm text-gray-700 italic">"{booking.reviewComment}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">— {booking.clientName}</p>
                      </div>
                    )}

                    {booking.status === "completed" && !booking.reviewRating && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-xs text-gray-400 italic">No review from customer yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action bar */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {booking.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                          disabled={!!actionLoading} onClick={() => handleStatus(booking.id, "confirmed")}>
                          {isActing("confirmed") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                          disabled={!!actionLoading} onClick={() => handleStatus(booking.id, "cancelled")}>
                          {isActing("cancelled") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Decline
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                          disabled={!!actionLoading} onClick={() => handleStatus(booking.id, "in-progress")}>
                          {isActing("in-progress") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          Start Job
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                          disabled={!!actionLoading} onClick={() => handleStatus(booking.id, "cancelled")}>
                          {isActing("cancelled") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Request Cancel (OTP)
                        </Button>
                      </>
                    )}
                    {booking.status === "in-progress" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                          disabled={!!actionLoading} onClick={() => handleStatus(booking.id, "completed")}>
                          {isActing("completed") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                          Request Complete (OTP)
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                          disabled={!!actionLoading} onClick={() => handleStatus(booking.id, "cancelled")}>
                          {isActing("cancelled") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Request Cancel (OTP)
                        </Button>
                      </>
                    )}
                    {booking.status === "completed" && (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Job completed
                      </span>
                    )}
                    {booking.status === "completed" && booking.reviewRating && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => {
                          setReviewModalTitle(`Review — ${booking.service}`);
                          setReviewModal([{
                            id: booking.id,
                            clientName: booking.clientName,
                            service: booking.service,
                            rating: booking.reviewRating!,
                            review: booking.reviewComment ?? "",
                            date: booking.createdAt,
                            response: booking.reviewResponse ?? undefined,
                          }]);
                        }}
                      >
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        View Review
                      </Button>
                    )}
                  </div>

                  <Button size="sm" variant="outline" className="gap-1.5 text-gray-600">
                    <Download className="w-3.5 h-3.5" />
                    Invoice
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ServiceReviewsModal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={reviewModalTitle}
        reviews={reviewModal ?? []}
      />
    </DashboardLayout>
  );
}

