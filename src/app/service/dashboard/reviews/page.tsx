// app/service/dashboard/reviews/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Star, MessageCircle, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Review {
  id: string;
  clientName: string;
  service: string;
  rating: number;
  review: string;
  date: string;
  helpful: number;
}

export default function ReviewsPage() {
  const reviews: Review[] = [
    {
      id: "1",
      clientName: "Rajesh Kumar",
      service: "Plumbing Installation",
      rating: 5,
      review: "Excellent work! Very professional and timely service. He arrived on time and completed the work with great quality. Highly recommended for anyone looking for plumbing services!",
      date: "2026-02-20",
      helpful: 12,
    },
    {
      id: "2",
      clientName: "Priya Singh",
      service: "Electrical Repair",
      rating: 4,
      review: "Good services provided and completed the task efficiently. Would have appreciated a bit more communication during the work, but overall satisfied.",
      date: "2026-02-19",
      helpful: 8,
    },
    {
      id: "3",
      clientName: "Amit Patel",
      service: "Maintenance Check",
      rating: 5,
      review: "Outstanding! Professional, punctual, and thorough work. Would definitely hire again for any maintenance work needed.",
      date: "2026-02-18",
      helpful: 15,
    },
    {
      id: "4",
      clientName: "Kavya Singh",
      service: "AC Installation",
      rating: 3,
      review: "Service was okay but took longer than expected. Still got the job done properly.",
      date: "2026-02-16",
      helpful: 5,
    },
  ];

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;
  const threeStarCount = reviews.filter((r) => r.rating === 3).length;
  const twoStarCount = reviews.filter((r) => r.rating === 2).length;
  const oneStarCount = reviews.filter((r) => r.rating === 1).length;

  const totalReviews = reviews.length;
  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  ).toFixed(1);

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
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
