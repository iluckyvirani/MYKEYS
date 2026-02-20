"use client";

import { Star, MessageCircle, User } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  clientName: string;
  service: string;
  rating: number;
  review: string;
  date: string;
}

export default function ReviewsCard() {
  const reviews: Review[] = [
    {
      id: "1",
      clientName: "Rajesh Kumar",
      service: "Plumbing Installation",
      rating: 5,
      review: "Excellent work! Very professional and timely service. Highly recommended!",
      date: "2026-02-20",
    },
    {
      id: "2",
      clientName: "Priya Singh",
      service: "Electrical Repair",
      rating: 4,
      review: "Good services provided. Completed the task efficiently.",
      date: "2026-02-19",
    },
    {
      id: "3",
      clientName: "Amit Patel",
      service: "Maintenance Check",
      rating: 5,
      review: "Outstanding! Would definitely hire again for any maintenance work.",
      date: "2026-02-18",
    },
  ];

  const averageRating =
    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

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
        {reviews.map((review) => (
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
        ))}
      </div>
    </div>
  );
}
