"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ReviewResponseModal } from "@/components/dashboard/owner/bookings/ReviewResponseModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  Star,
  MessageSquare,
  Filter,
  Search,
  Loader,
  AlertCircle,
} from "lucide-react";

interface Review {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  response?: string | null;
}

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "pending">( "all");
  const [search, setSearch] = useState("");
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseLoading, setResponseLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filterMode]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("limit", "50");
      if (filterMode === "pending") {
        params.append("hasResponse", "false");
      }

      const response = await api.get(`/owner/reviews?${params.toString()}`);

      if (response.data?.success && response.data.data?.items) {
        setReviews(response.data.data.items);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponse = (review: Review) => {
    setSelectedReview(review);
    setResponseModalOpen(true);
  };

  const handleSubmitResponse = async (response: string) => {
    if (!selectedReview) return;

    try {
      setResponseLoading(true);
      await api.post(`/owner/reviews/${selectedReview.id}/response`, {
        response,
      });

      // Update the review in the list
      setReviews(
        reviews.map((r) =>
          r.id === selectedReview.id
            ? {
                ...r,
                response: response,
              }
            : r
        )
      );

      setResponseModalOpen(false);
      setSelectedReview(null);
    } catch (err) {
      console.error("Error submitting response:", err);
      alert("Failed to submit response");
    } finally {
      setResponseLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (
      search &&
      !review.user.firstName.toLowerCase().includes(search.toLowerCase()) &&
      !review.user.lastName.toLowerCase().includes(search.toLowerCase()) &&
      !review.propertyTitle.toLowerCase().includes(search.toLowerCase()) &&
      !review.comment.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  const pendingResponses = reviews.filter((r) => !r.response).length;

  if (error) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="bg-red-50 border border-red-200 rounded-[5px] p-4 text-red-700">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
          <Button size="sm" onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Reviews</h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to guest reviews for your properties
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-amber-600">{avgRating}</div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(parseFloat(avgRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className={`text-2xl font-bold ${pendingResponses > 0 ? "text-orange-600" : "text-green-600"}`}>
              {pendingResponses}
            </div>
            <div className="text-sm text-gray-600">Pending Responses</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="text-2xl font-bold text-gray-900">
              {reviews.filter((r) => r.response).length}
            </div>
            <div className="text-sm text-gray-600">Responded</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-[5px] border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by guest name, property, or comment..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterMode === "all" ? "default" : "outline"}
              onClick={() => setFilterMode("all")}
            >
              All Reviews
            </Button>
            <Button
              variant={filterMode === "pending" ? "default" : "outline"}
              onClick={() => setFilterMode("pending")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Pending ({pendingResponses})
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-[5px] border py-12 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin text-green-600" />
            <span className="text-gray-600">Loading reviews...</span>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-[5px] border py-12 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-semibold mb-1">
            {filterMode === "pending" ? "No pending responses" : "No reviews"}
          </h3>
          <p className="text-gray-500 text-sm">
            {filterMode === "pending"
              ? "You have responded to all reviews"
              : "No reviews found for your properties"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-[5px] border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.user.avatar && (
                    <img
                      src={review.user.avatar}
                      alt={`${review.user.firstName} ${review.user.lastName}`}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user.firstName} {review.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900">{review.rating}</span>
                </div>
              </div>

              <div className="mb-4">
                <Link href={`/owner/dashboard/properties/${review.propertyId}`} className="text-sm text-green-600 hover:text-green-700 font-medium mb-2 block">
                  {review.propertyTitle}
                </Link>
                <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
                <p className="text-gray-700 text-sm">{review.comment}</p>
              </div>

              {review.response ? (
                <div className="bg-green-50 border border-green-200 rounded-[5px] p-4 mb-4">
                  <p className="text-xs font-medium text-green-700 mb-2">YOUR RESPONSE</p>
                  <p className="text-gray-900 text-sm mb-2">{review.response}</p>
                  <p className="text-xs text-green-600">
                    Response added
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-[5px] p-4 mb-4">
                  <p className="text-xs font-medium text-amber-700">NO RESPONSE YET</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Responding to reviews helps build trust with guests
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => handleOpenResponse(review)}
                  variant={review.response ? "outline" : "default"}
                  className={review.response ? "" : "bg-green-600 hover:bg-green-700"}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {review.response ? "Edit Response" : "Add Response"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Response Modal */}
      {selectedReview && (
        <ReviewResponseModal
          isOpen={responseModalOpen}
          onClose={() => {
            setResponseModalOpen(false);
            setSelectedReview(null);
          }}
          onSubmit={handleSubmitResponse}
          review={{
            id: selectedReview.id,
            userName: `${selectedReview.user.firstName} ${selectedReview.user.lastName}`,
            userAvatar: selectedReview.user.avatar,
            rating: selectedReview.rating,
            title: selectedReview.title,
            comment: selectedReview.comment,
            date: new Date(selectedReview.createdAt).toLocaleDateString("en-IN"),
            existingResponse: selectedReview.response || undefined,
          }}
          loading={responseLoading}
        />
      )}
    </DashboardLayout>
  );
}
