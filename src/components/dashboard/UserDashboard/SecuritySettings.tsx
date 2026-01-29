// components/dashboard/UserDashboard/SecuritySettings.tsx
"use client";

import { Lock, Key, Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { api } from "@/lib/api";
import { ChangePasswordRequest } from "@/types/auth";

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordRequirements = [
    { text: "At least 8 characters", met: newPassword.length >= 8 },
    { text: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { text: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { text: "One number", met: /[0-9]/.test(newPassword) },
    { text: "One special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    if (!allRequirementsMet || !passwordsMatch) {
      setError("Please meet all password requirements and ensure passwords match");
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

      // Clear success message after 3 seconds
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

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Change Password</h4>
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
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Password Requirements</h5>
            <div className="space-y-2">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  {req.met ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={`text-sm ${req.met ? "text-green-600" : "text-gray-600"}`}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
            {newPassword && (
              <div className={`mt-3 text-sm font-medium ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </div>
            )}
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={!allRequirementsMet || !passwordsMatch || !currentPassword || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">SMS Authentication</div>
              <div className="text-sm text-gray-600">Receive codes via SMS</div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Authenticator App</div>
              <div className="text-sm text-gray-600">Use Google Authenticator or similar</div>
            </div>
            <Button variant="outline" size="sm">
              Set Up
            </Button>
          </div>

          {twoFactorEnabled && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">2FA is active</span>
              </div>
              <p className="text-sm text-green-700">
                Your account is protected with two-factor authentication.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Preferences */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Lock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Security Preferences</h4>
            <p className="text-sm text-gray-600">Configure your security settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Login Alerts</div>
              <div className="text-sm text-gray-600">Get notified of new sign-ins</div>
            </div>
            <Switch
              checked={loginAlerts}
              onCheckedChange={setLoginAlerts}
            />
          </div>

          <div>
            <Label htmlFor="sessionTimeout" className="font-medium text-gray-900 mb-2">
              Session Timeout
            </Label>
            <select
              id="sessionTimeout"
              className="w-full border rounded-lg px-3 py-2"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="0">Never (not recommended)</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Automatically log out after {sessionTimeout} minutes of inactivity
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Active Sessions</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Current Session</div>
                  <div className="text-sm text-gray-600">Chrome • Mumbai, India</div>
                  <div className="text-xs text-gray-500">Active now</div>
                </div>
                <Button variant="outline" size="sm">End Session</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Previous Session</div>
                  <div className="text-sm text-gray-600">Safari • Delhi, India</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
                <Button variant="ghost" size="sm">Remove</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200">
        <div className="p-6">
          <h4 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Deactivate Account</div>
                <div className="text-sm text-gray-600">Temporarily disable your account</div>
              </div>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                Deactivate
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Delete Account</div>
                <div className="text-sm text-gray-600">Permanently delete your account and all data</div>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}