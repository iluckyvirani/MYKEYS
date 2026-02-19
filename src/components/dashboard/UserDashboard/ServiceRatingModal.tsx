"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ServiceBooking {
  id: string;
  serviceName: string;
  providerName: string;
}

interface ServiceRatingModalProps {
  booking: ServiceBooking;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ServiceRatingModal({
  booking,
  onClose,
  onSubmit,
}: ServiceRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      // API call to submit rating
      // await api.post(`/service-bookings/${booking.id}/rating`, { rating, review });
      onSubmit();
    } catch (error) {
      console.error("Failed to submit rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Rate Your Service
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {booking.serviceName}
          </p>
          <p className="text-sm text-gray-600">{booking.providerName}</p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-900 mb-3">
            How was your experience?
          </p>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center mt-2 text-sm text-gray-600">
              {rating === 5
                ? "Excellent!"
                : rating === 4
                  ? "Very Good!"
                  : rating === 3
                    ? "Good"
                    : rating === 2
                      ? "Fair"
                      : "Poor"}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Share your experience (optional)
          </label>
          <Textarea
            placeholder="Tell others about your experience with this service..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-24"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 cursor-pointer"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </div>
    </div>
  );
}
