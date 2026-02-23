"use client";

import { AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UpgradeReason = "properties" | "featured" | "storage" | "leads";

interface Props {
  isOpen: boolean;
  reason: UpgradeReason;
  onUpgrade: () => void;
  onDismiss: () => void;
}

const upgradeMessages: Record<
  UpgradeReason,
  {
    title: string;
    message: string;
    suggestion: string;
  }
> = {
  properties: {
    title: "Properties Limit Reached",
    message:
      "You've reached the maximum number of properties you can list with your current plan.",
    suggestion: "Upgrade to list more properties and expand your portfolio.",
  },
  featured: {
    title: "Featured Listings Limit Reached",
    message: "You've used all your featured listing slots for this month.",
    suggestion: "Upgrade to get more featured listing slots and increase visibility.",
  },
  storage: {
    title: "Storage Quota Exceeded",
    message: "You've used all the storage available on your current plan.",
    suggestion: "Upgrade to get more storage space for images and documents.",
  },
  leads: {
    title: "Lead Limit Reached",
    message: "You've reached your daily or total lead limit for this billing period.",
    suggestion: "Upgrade to receive more leads and grow your business faster.",
  },
};

export default function UpgradePromptModal({
  isOpen,
  reason,
  onUpgrade,
  onDismiss,
}: Props) {
  if (!isOpen) return null;

  const content = upgradeMessages[reason];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">{content.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">{content.message}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <p className="text-blue-900 text-sm">{content.suggestion}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm">Popular Upgrades</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ STANDARD Plan: 5 properties, 10 daily leads</li>
              <li>✓ PREMIUM Plan: 20 properties, 50 daily leads</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t p-6 bg-gray-50">
          <Button
            onClick={onDismiss}
            variant="outline"
            className="flex-1"
          >
            Remind Later
          </Button>
          <Button
            onClick={onUpgrade}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
