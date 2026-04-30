// app/service/dashboard/reviews/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Star, MessageCircle, Loader2, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  clientName: string;
  service: string;
  rating: number;
  review: string;
  date: string;
  helpful: number;
  response?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/service/reviews?limit=50&sortOrder=desc");
        // API returns { reviews, stats, pagination } inside data.data
        const data = res.data?.data?.reviews ?? res.data?.data?.items ?? [];
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await api.patch(`/service/reviews/${reviewId}/reply`, { response: replyText });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, response: replyText } : r))
      );
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error("Failed to reply to review:", err);
    } finally {
      setReplyLoading(false);
    }
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  const countFor = (r: number) => reviews.filter((v) => v.rating === r).length;

  const visibleReviews =
    filterRating === null ? reviews : reviews.filter((r) => r.rating === filterRating);

  const RATING_FILTERS = [
    { label: "All", value: null },
    { label: "5 ★", value: 5 },
    { label: "4 ★", value: 4 },
    { label: "3 ★", value: 3 },
    { label: "2 ★", value: 2 },
    { label: "1 ★", value: 1 },
  ];

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">
            See what your customers say and reply to their feedback.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Average rating */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
          <div>
            <p className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{totalReviews} total reviews</p>
          </div>
          {/* Rating bar breakdown */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = countFor(star);
              const pct = totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-gray-500 text-right">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top stat cards */}
        {[
          { label: "5 Star", count: countFor(5), color: "text-green-600", bg: "bg-green-50" },
          { label: "4 Star", count: countFor(4), color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-5 flex flex-col justify-between`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-gray-400">reviews</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {RATING_FILTERS.map(({ label, value }) => (
          <button
            key={String(value)}
            onClick={() => setFilterRating(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              filterRating === value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {label}
            {value !== null && (
              <span className="ml-1.5 text-xs opacity-70">({countFor(value)})</span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
        </div>
      ) : visibleReviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Reviews from completed bookings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar initial */}
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
                    {review.clientName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">{review.clientName}</p>
                    <p className="text-xs text-gray-500">{review.service}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {/* Star rating */}
                  <div className="flex gap-0.5 justify-end mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(review.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Review comment */}
              {review.review && (
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  &ldquo;{review.review}&rdquo;
                </p>
              )}

              {/* Provider reply */}
              {review.response && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Your reply</p>
                  <p className="text-sm text-gray-700">{review.response}</p>
                </div>
              )}

              {/* Reply input */}
              {replyingTo === review.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                    onKeyDown={(e) => e.key === "Enter" && handleReply(review.id)}
                  />
                  <Button
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-700 text-white gap-1"
                    onClick={() => handleReply(review.id)}
                    disabled={replyLoading || !replyText.trim()}
                  >
                    {replyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Send
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setReplyingTo(null); setReplyText(""); }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                !review.response && (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Reply to this review
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

