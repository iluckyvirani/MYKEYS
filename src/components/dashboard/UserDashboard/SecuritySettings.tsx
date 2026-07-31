"use client";

import { Key, Eye, EyeOff, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChangePasswordRequest } from "@/types/auth";

type EmailChangeStep = "VERIFY_OLD" | "VERIFY_NEW" | null;

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Change email
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState<EmailChangeStep>(null);
  const [maskedCurrent, setMaskedCurrent] = useState("");
  const [maskedPending, setMaskedPending] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [resendWait, setResendWait] = useState(0);

  const passwordRequirements = [
    { text: "At least 8 characters", met: newPassword.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { text: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { text: "One number", met: /[0-9]/.test(newPassword) },
    {
      text: "One special character",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch =
    newPassword === confirmPassword && newPassword.length > 0;

  const loadEmailStatus = useCallback(async () => {
    try {
      const res = await api.get("/auth/change-email");
      const data = res.data?.data;
      if (!data) return;
      setCurrentEmail(data.currentEmail || "");
      setEmailStep(data.step || null);
      setMaskedCurrent(data.maskedCurrentEmail || "");
      setMaskedPending(data.maskedPendingEmail || "");
      if (data.pendingEmail) setNewEmail(data.pendingEmail);
      setResendWait(data.resendWaitSeconds || 0);
    } catch (err) {
      console.error("Failed to load email change status", err);
    }
  }, []);

  useEffect(() => {
    loadEmailStatus();
  }, [loadEmailStatus]);

  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setInterval(() => {
      setResendWait((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendWait]);

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    if (!allRequirementsMet || !passwordsMatch) {
      setError(
        "Please meet all password requirements and ensure passwords match"
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: ChangePasswordRequest = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      await api.post("/auth/change-password", payload);

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to change password. Please try again.";
      setError(message);
      console.error("Change password error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyEmailStep = (data: any) => {
    setEmailStep(data.step || null);
    setMaskedCurrent(data.maskedCurrentEmail || maskedCurrent);
    setMaskedPending(data.maskedPendingEmail || "");
    if (data.pendingEmail) setNewEmail(data.pendingEmail);
    setResendWait(data.resendWaitSeconds || 0);
    setEmailOtp("");
  };

  const startEmailChange = async () => {
    setEmailLoading(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      const res = await api.post("/auth/change-email", {
        action: "start",
        newEmail,
      });
      applyEmailStep(res.data?.data || {});
      setEmailSuccess("Code sent to your current email. Enter it below.");
    } catch (err: any) {
      setEmailError(err.response?.data?.message || "Failed to start email change");
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    setEmailLoading(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      const action = emailStep === "VERIFY_OLD" ? "verify-old" : "verify-new";
      const res = await api.post("/auth/change-email", {
        action,
        otp: emailOtp,
      });
      const data = res.data?.data || {};

      if (action === "verify-old") {
        applyEmailStep(data);
        setEmailSuccess(
          "Current email verified. A new code was sent to your new email."
        );
      } else {
        setEmailStep(null);
        setCurrentEmail(data.email || newEmail);
        setNewEmail("");
        setEmailOtp("");
        setMaskedPending("");
        setEmailSuccess("Email updated successfully!");

        // Refresh stored user email
        try {
          const me = await api.get("/auth/me");
          if (me.data?.data) {
            localStorage.setItem("user", JSON.stringify(me.data.data));
          }
        } catch {
          /* ignore */
        }
      }
    } catch (err: any) {
      setEmailError(err.response?.data?.message || "Verification failed");
    } finally {
      setEmailLoading(false);
    }
  };

  const resendEmailOtp = async () => {
    if (resendWait > 0) return;
    setEmailLoading(true);
    setEmailError("");
    try {
      const res = await api.post("/auth/change-email", { action: "resend" });
      applyEmailStep(res.data?.data || {});
      setEmailSuccess("Code resent.");
    } catch (err: any) {
      setEmailError(err.response?.data?.message || "Failed to resend code");
      if (err.response?.status === 429) {
        const msg = err.response?.data?.message || "";
        const m = msg.match(/(\d+)s/);
        if (m) setResendWait(Number(m[1]));
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const cancelEmailChange = async () => {
    setEmailLoading(true);
    setEmailError("");
    try {
      await api.post("/auth/change-email", { action: "cancel" });
      setEmailStep(null);
      setNewEmail("");
      setEmailOtp("");
      setMaskedPending("");
      setEmailSuccess("Email change cancelled.");
      await loadEmailStatus();
    } catch (err: any) {
      setEmailError(err.response?.data?.message || "Failed to cancel");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Change Password
            </h4>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-[5px] text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
                disabled={loading}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={loading}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
                disabled={loading}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={loading}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                disabled={loading}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">
              Password Requirements
            </h5>
            <div className="space-y-2">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  {req.met ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span
                    className={`text-sm ${
                      req.met ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
            {newPassword && (
              <div
                className={`mt-3 text-sm font-medium ${
                  passwordsMatch ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </div>
            )}
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={
              !allRequirementsMet ||
              !passwordsMatch ||
              !currentPassword ||
              loading
            }
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </div>
      </div>

      {/* Change Email */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Mail className="w-5 h-5 text-[#339390]" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Change Email</h4>
            <p className="text-sm text-gray-600">
              Verify your current email, then verify the new one
            </p>
          </div>
        </div>

        {emailError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {emailError}
          </div>
        )}
        {emailSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[5px] text-sm">
            {emailSuccess}
          </div>
        )}

        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          Current email:{" "}
          <span className="font-medium text-gray-900">
            {currentEmail || "—"}
          </span>
        </div>

        {!emailStep && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="newEmail">New email address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={emailLoading}
                placeholder="you@example.com"
              />
            </div>
            <ol className="text-xs text-gray-500 list-decimal pl-4 space-y-1">
              <li>We send a code to your current email</li>
              <li>After that, we send a code to the new email</li>
              <li>Your email updates only after both are verified</li>
            </ol>
            <Button
              onClick={startEmailChange}
              disabled={!newEmail.trim() || emailLoading}
              className="w-full bg-[#339390] hover:bg-[#2a7a78]"
            >
              {emailLoading ? "Sending…" : "Send code to current email"}
            </Button>
          </div>
        )}

        {emailStep === "VERIFY_OLD" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the code sent to{" "}
              <strong>{maskedCurrent || currentEmail}</strong>
            </p>
            <div>
              <Label htmlFor="emailOtpOld">Verification code</Label>
              <Input
                id="emailOtpOld"
                value={emailOtp}
                onChange={(e) =>
                  setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={emailLoading}
                placeholder="6-digit code"
                inputMode="numeric"
              />
            </div>
            <Button
              onClick={verifyEmailOtp}
              disabled={emailOtp.length < 6 || emailLoading}
              className="w-full bg-[#339390] hover:bg-[#2a7a78]"
            >
              {emailLoading ? "Verifying…" : "Verify current email"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={resendWait > 0 || emailLoading}
                onClick={resendEmailOtp}
              >
                {resendWait > 0 ? `Resend in ${resendWait}s` : "Resend code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                disabled={emailLoading}
                onClick={cancelEmailChange}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {emailStep === "VERIFY_NEW" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the code sent to{" "}
              <strong>{maskedPending || newEmail}</strong>
            </p>
            <div>
              <Label htmlFor="emailOtpNew">Verification code</Label>
              <Input
                id="emailOtpNew"
                value={emailOtp}
                onChange={(e) =>
                  setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={emailLoading}
                placeholder="6-digit code"
                inputMode="numeric"
              />
            </div>
            <Button
              onClick={verifyEmailOtp}
              disabled={emailOtp.length < 6 || emailLoading}
              className="w-full bg-[#339390] hover:bg-[#2a7a78]"
            >
              {emailLoading ? "Verifying…" : "Verify new email & update"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={resendWait > 0 || emailLoading}
                onClick={resendEmailOtp}
              >
                {resendWait > 0 ? `Resend in ${resendWait}s` : "Resend code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                disabled={emailLoading}
                onClick={cancelEmailChange}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
