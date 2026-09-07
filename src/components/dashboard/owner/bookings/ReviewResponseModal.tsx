"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: string) => Promise<void>;
  review: {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
    existingResponse?: string;
  };
  loading?: boolean;
}

export function ReviewResponseModal({
  isOpen,
  onClose,
  onSubmit,
  review,
  loading = false,
}: ReviewResponseModalProps) {
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (isOpen) {
      setResponse(review.existingResponse || "");
    }
  }, [isOpen, review.existingResponse]);

  const handleSubmit = async () => {
    if (!response.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      await onSubmit(response);
      setResponse("");
      onClose();
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Respond to Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Review Summary */}
          <div className="bg-gray-50 rounded-[5px] p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {review.userAvatar && (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{review.userName}</p>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {review.title && (
              <h4 className="font-semibold text-gray-900">{review.title}</h4>
            )}

            <p className="text-sm text-gray-700">{review.comment}</p>
          </div>

          {/* Response Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Response
            </label>
            <Textarea
              placeholder="Share your response to this review... (Be professional and courteous)"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {response.length} / 500 characters
            </p>
          </div>

          {review.existingResponse && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-[5px] p-3">
              You already have a response to this review. Submitting will update it.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !response.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Submitting..." : review.existingResponse ? "Update Response" : "Add Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
