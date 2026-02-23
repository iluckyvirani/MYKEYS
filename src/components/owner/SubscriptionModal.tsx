"use client";

import { useState } from "react";
import { X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import PackageComparison from "./PackageComparison";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPackageTier?: string;
}

export default function SubscriptionModal({ isOpen, onClose, onSuccess, currentPackageTier }: Props) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "confirm">("select");

  const handleSelectPackage = (packageId: string, duration: "monthly" | "yearly") => {
    setSelectedPackageId(packageId);
    setSelectedDuration(duration);
    setError(null);
    setStep("confirm");
  };

  const handleSubscribe = async () => {
    if (!selectedPackageId) {
      setError("Please select a package");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/owner/packages/subscribe", {
        packageId: selectedPackageId,
        duration: selectedDuration,
      });

      if (response.data) {
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to subscribe to package");
      console.error("Subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setStep("select");
    setSelectedPackageId(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === "select" ? "Choose Your Plan" : "Review Your Selection"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "select" ? (
            // Package Selection
            <PackageComparison
              onSelectPackage={handleSelectPackage}
              currentPackageTier={currentPackageTier}
            />
          ) : (
            // Confirmation Step
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Subscription Details</h3>
                <div className="space-y-3 text-green-900">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Plan:</span>
                    <span className="font-semibold">
                      (To be displayed after package fetch)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Billing Cycle:</span>
                    <span className="font-semibold capitalize">
                      {selectedDuration === "monthly" ? "Monthly" : "Yearly"}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-green-300">
                    <span>Price:</span>
                    <span>(To be calculated)</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm">
                  💡 Your subscription will be automatically renewed at the end of the billing cycle. You can manage
                  your subscription anytime from your dashboard.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 text-sm">
                  ⚠️ If you already have an active subscription, it will be cancelled and replaced with this new plan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-6 sticky bottom-0 bg-gray-50">
          {step === "confirm" && (
            <Button
              onClick={handleBackToSelection}
              variant="outline"
              className="px-6 py-2"
              disabled={loading}
            >
              Back
            </Button>
          )}
          <div className="flex-1"></div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 py-2"
              disabled={loading}
            >
              Cancel
            </Button>
            {step === "confirm" && (
              <Button
                onClick={handleSubscribe}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Subscription"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
