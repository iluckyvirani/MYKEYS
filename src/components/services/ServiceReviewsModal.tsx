"use client";

import { useState, useEffect } from "react";
import { Star, X, Loader2, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";

export interface ServiceReview {
  id: string;
  clientName: string;
  service: string;
  rating: number;
  review: string;
  date: string;
  response?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Pass pre-loaded reviews directly (e.g. single booking review) */
  reviews?: ServiceReview[];
  /** Or pass a URL to fetch from (e.g. "/service/reviews" or "/services/providers/[id]/reviews") */
  fetchUrl?: string;
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ServiceReviewsModal({ open, onClose, title, reviews: preloaded, fetchUrl }: Props) {
  const [reviews, setReviews] = useState<ServiceReview[]>(preloaded ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (preloaded) {
      setReviews(preloaded);
      return;
    }

    if (fetchUrl) {
      setLoading(true);
      api
        .get(fetchUrl)
        .then((res) => {
          const data = res.data?.data?.reviews ?? res.data?.data?.items ?? [];
          setReviews(Array.isArray(data) ? data : []);
        })
        .catch(() => setReviews([]))
        .finally(() => setLoading(false));
    }
  }, [open, fetchUrl, preloaded]);

  if (!open) return null;

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRow rating={Math.round(avg)} />
                <span className="text-sm font-semibold text-gray-800">{avg.toFixed(1)}</span>
                <span className="text-sm text-gray-500">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Reviews from completed bookings will appear here.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar initial */}
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
                      {review.clientName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {review.clientName}
                      </p>
                      <p className="text-xs text-gray-500">{review.service}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <StarRow rating={review.rating} size="xs" />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(() => {
                        try {
                          return new Date(review.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });
                        } catch {
                          return review.date;
                        }
                      })()}
                    </p>
                  </div>
                </div>

                {/* Comment */}
                {review.review && (
                  <p className="text-sm text-gray-700 italic mb-3">
                    &ldquo;{review.review}&rdquo;
                  </p>
                )}

                {/* Provider reply */}
                {review.response && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500">Provider&apos;s reply</p>
                    </div>
                    <p className="text-sm text-gray-700">{review.response}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
