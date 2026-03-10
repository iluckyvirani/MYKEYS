// app/service/dashboard/reviews/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Star, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/service/reviews?limit=50&sortOrder=desc");
        const data = res.data?.data?.items;
        if (data) {
          setReviews(data);
        }
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
    try {
      await api.patch(`/service/reviews/${reviewId}/reply`, { response: replyText });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, response: replyText } : r))
      );
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error("Failed to reply to review:", err);
    }
  };

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;
  const threeStarCount = reviews.filter((r) => r.rating === 3).length;
  const twoStarCount = reviews.filter((r) => r.rating === 2).length;
  const oneStarCount = reviews.filter((r) => r.rating === 1).length;

  const totalReviews = reviews.length;
  const averageRating = totalReviews === 0
    ? "0.0"
    : (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);

  const getRating = (rating: number) => {
    return reviews.filter((r) => r.rating === rating);
  };

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-gray-600 mt-2">
          See what your customers are saying about your services.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {averageRating}
              </p>
            </div>
            <div className="text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 inline-block ${
                    i < Math.round(parseFloat(averageRating))
                      ? "fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{totalReviews} reviews</p>
        </div>

        {[5, 4, 3].map((star) => (
          <div key={star} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              {star}
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {star === 5
                ? fiveStarCount
                : star === 4
                ? fourStarCount
                : threeStarCount}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {(
                ((star === 5
                  ? fiveStarCount
                  : star === 4
                  ? fourStarCount
                  : threeStarCount) /
                  totalReviews) *
                100
              ).toFixed(0)}
              %
            </p>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none p-0">
            <TabsTrigger value="all" className="rounded-none">
              All ({totalReviews})
            </TabsTrigger>
            <TabsTrigger value="5" className="rounded-none">
              5 Stars ({fiveStarCount})
            </TabsTrigger>
            <TabsTrigger value="4" className="rounded-none">
              4 Stars ({fourStarCount})
            </TabsTrigger>
            <TabsTrigger value="3" className="rounded-none">
              3 Stars ({threeStarCount})
            </TabsTrigger>
          </TabsList>

          <div className="p-5 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No reviews yet</p>
              </div>
            ) : (
            <>
            <TabsContent value="all" className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.clientName}
                      </h3>
                      <p className="text-sm text-gray-600">{review.service}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{review.review}</p>

                  {review.response && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Your Reply:</p>
                      <p className="text-sm text-gray-700">{review.response}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t">
                    {!review.response && (
                      replyingTo === review.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 text-sm px-3 py-1 border rounded-lg"
                          />
                          <button
                            onClick={() => handleReply(review.id)}
                            className="text-sm text-white bg-green-600 px-3 py-1 rounded-lg hover:bg-green-700"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            className="text-sm text-gray-600 px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                          onClick={() => setReplyingTo(review.id)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Reply
                        </button>
                      )
                    )}
                    <button className="text-sm text-gray-600 hover:text-gray-900">
                      👍 {review.helpful}
                    </button>
                  </div>
                </div>
              ))}
            </TabsContent>

            {["5", "4", "3"].map((rating) => (
              <TabsContent key={rating} value={rating} className="space-y-4">
                {getRating(parseInt(rating)).length > 0 ? (
                  getRating(parseInt(rating)).map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {review.clientName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {review.service}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {review.review}
                      </p>

                      <div className="flex items-center gap-4 pt-3 border-t">
                        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          Reply
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-900">
                          👍 {review.helpful}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No reviews with this rating</p>
                  </div>
                )}
              </TabsContent>
            ))}
            </>
            )}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
