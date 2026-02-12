"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: {
    rating: number;
    comment: string;
    cleanlinessRating: number;
    communicationRating: number;
    accuracyRating: number;
    locationRating: number;
    valueRating: number;
  }) => Promise<void>;
  bookingId: string;
  propertyTitle: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  bookingId,
  propertyTitle,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [accuracyRating, setAccuracyRating] = useState(5);
  const [locationRating, setLocationRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({
        rating,
        comment,
        cleanlinessRating,
        communicationRating,
        accuracyRating,
        locationRating,
        valueRating,
      });
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRating(5);
    setComment("");
    setCleanlinessRating(5);
    setCommunicationRating(5);
    setAccuracyRating(5);
    setLocationRating(5);
    setValueRating(5);
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm font-medium text-gray-700 w-24">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="focus:outline-none transition-colors"
          >
            <Star
              size={20}
              className={`${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[5px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience at {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Overall Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="p-4 bg-gray-50 rounded-[5px] space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">
              Rate Different Aspects
            </h4>
            <StarRating
              value={cleanlinessRating}
              onChange={setCleanlinessRating}
              label="Cleanliness"
            />
            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
              label="Communication"
            />
            <StarRating
              value={accuracyRating}
              onChange={setAccuracyRating}
              label="Accuracy"
            />
            <StarRating
              value={locationRating}
              onChange={setLocationRating}
              label="Location"
            />
            <StarRating
              value={valueRating}
              onChange={setValueRating}
              label="Value"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Review (Required)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience, what you liked, what could be improved..."
              className="min-h-32 rounded-[5px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[5px]">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-[5px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !comment.trim()}
            className="flex-1 rounded-[5px]"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
