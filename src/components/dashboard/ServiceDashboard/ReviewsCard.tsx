"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Review {
  id: string;
  clientName: string;
  service: string;
  rating: number;
  review: string;
  date: string;
}

export default function ReviewsCard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/service/reviews?limit=3&sortOrder=desc");
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

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customer Reviews</h2>
          <p className="text-sm text-gray-600 mt-1">
            Average Rating: <span className="font-semibold">{averageRating}/5</span>
          </p>
        </div>
        <Link
          href="/service/dashboard/reviews"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No reviews yet</p>
        ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {review.clientName}
                </h3>
                <p className="text-sm text-gray-600">{review.service}</p>
              </div>
              <div className="flex items-center gap-1">
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
            </div>

            <p className="text-sm text-gray-600 mb-2">{review.review}</p>
            <p className="text-xs text-gray-500">
              {new Date(review.date).toLocaleDateString()}
            </p>
          </div>
        )))}
      </div>
    </div>
  );
}
