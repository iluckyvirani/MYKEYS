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
import { Mail, User } from "lucide-react";

interface InquiryReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: string) => Promise<void>;
  inquiry: {
    id: string;
    guestName: string;
    guestEmail: string;
    message: string;
    existingResponse?: string;
    createdAt: string;
  };
  loading?: boolean;
}

export function InquiryReplyModal({
  isOpen,
  onClose,
  onSubmit,
  inquiry,
  loading = false,
}: InquiryReplyModalProps) {
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (isOpen) {
      setResponse(inquiry.existingResponse || "");
    }
  }, [isOpen, inquiry.existingResponse]);

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
          <DialogTitle>Reply to Inquiry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Inquiry Summary */}
          <div className="bg-gray-50 rounded-[5px] p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{inquiry.guestName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${inquiry.guestEmail}`} className="hover:text-green-600">
                    {inquiry.guestEmail}
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">INQUIRY MESSAGE</p>
              <p className="text-sm text-gray-700">{inquiry.message}</p>
            </div>

            <div className="text-xs text-gray-500">
              Sent on {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Response Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Response
            </label>
            <Textarea
              placeholder="Write a professional response to this inquiry... (Be clear about availability, pricing, and next steps)"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-40 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {response.length} / 1000 characters
            </p>
          </div>

          {inquiry.existingResponse && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-[5px] p-3">
              You have already replied to this inquiry. Submitting will update your previous response.
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
            {loading ? "Sending..." : inquiry.existingResponse ? "Update Response" : "Send Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
