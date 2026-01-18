// components/dashboard/UserDashboard/NotificationSettings.tsx
"use client";

import { Bell, Mail, MessageSquare, Calendar, CreditCard, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    // Booking Notifications
    bookingConfirmation: true,
    bookingReminder: true,
    checkinReminder: true,
    checkoutReminder: true,
    bookingCancellation: true,
    bookingModification: true,

    // Inquiry Notifications
    newInquiry: true,
    inquiryResponse: true,
    inquiryFollowUp: true,

    // Payment Notifications
    paymentConfirmation: true,
    paymentReminder: true,
    paymentFailure: true,
    refundIssued: true,

    // Review Notifications
    reviewRequest: true,
    newReview: true,
    reviewResponse: true,

    // Promotional Notifications
    promotionalEmails: false,
    newsletter: false,
    priceAlerts: true,
    similarProperties: true,

    // Platform Notifications
    platformUpdates: true,
    policyChanges: false,
    securityAlerts: true,
  });

  const notificationCategories = [
    {
      title: "Booking Notifications",
      icon: Calendar,
      settings: [
        { key: "bookingConfirmation", label: "Booking confirmations", description: "When your booking is confirmed" },
        { key: "bookingReminder", label: "Booking reminders", description: "Reminders before your stay" },
        { key: "checkinReminder", label: "Check-in reminders", description: "Reminders on check-in day" },
        { key: "checkoutReminder", label: "Check-out reminders", description: "Reminders on check-out day" },
        { key: "bookingCancellation", label: "Booking cancellations", description: "When a booking is cancelled" },
        { key: "bookingModification", label: "Booking modifications", description: "When a booking is modified" },
      ]
    },
    {
      title: "Inquiry Notifications",
      icon: MessageSquare,
      settings: [
        { key: "newInquiry", label: "New inquiry responses", description: "When owner responds to your inquiry" },
        { key: "inquiryResponse", label: "Inquiry status updates", description: "Updates on inquiry status" },
        { key: "inquiryFollowUp", label: "Inquiry follow-ups", description: "Reminders to follow up on inquiries" },
      ]
    },
    {
      title: "Payment Notifications",
      icon: CreditCard,
      settings: [
        { key: "paymentConfirmation", label: "Payment confirmations", description: "When payments are processed" },
        { key: "paymentReminder", label: "Payment reminders", description: "Reminders for upcoming payments" },
        { key: "paymentFailure", label: "Payment failures", description: "When a payment fails" },
        { key: "refundIssued", label: "Refund notifications", description: "When refunds are issued" },
      ]
    },
    {
      title: "Review Notifications",
      icon: Star,
      settings: [
        { key: "reviewRequest", label: "Review requests", description: "Requests to review your stay" },
        { key: "newReview", label: "New reviews", description: "When owners review you" },
        { key: "reviewResponse", label: "Review responses", description: "When owners respond to your review" },
      ]
    },
    {
      title: "Promotional Notifications",
      icon: Bell,
      settings: [
        { key: "promotionalEmails", label: "Promotional emails", description: "Special offers and discounts" },
        { key: "newsletter", label: "Newsletter", description: "Monthly property updates" },
        { key: "priceAlerts", label: "Price alerts", description: "When saved properties have price drops" },
        { key: "similarProperties", label: "Property recommendations", description: "Similar properties you might like" },
      ]
    },
    {
      title: "Platform Notifications",
      icon: AlertCircle,
      settings: [
        { key: "platformUpdates", label: "Platform updates", description: "New features and improvements" },
        { key: "policyChanges", label: "Policy changes", description: "Updates to terms and policies" },
        { key: "securityAlerts", label: "Security alerts", description: "Important security notifications" },
      ]
    },
  ];

  const handleToggle = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications]
    });
  };

  const handleEnableAll = () => {
    const allTrue = Object.fromEntries(
      Object.keys(notifications).map(key => [key, true])
    );
    setNotifications(allTrue as typeof notifications);
  };

  const handleDisableAll = () => {
    const allFalse = Object.fromEntries(
      Object.keys(notifications).map(key => [key, false])
    );
    setNotifications(allFalse as typeof notifications);
  };

  const enabledCount = Object.values(notifications).filter(Boolean).length;
  const totalCount = Object.keys(notifications).length;

  return (
    <div className="space-y-8">
      {/* Notification Summary */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Notification Preferences</h4>
            <p className="text-sm text-gray-600 mt-1">
              Choose how and when you want to be notified
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{enabledCount}/{totalCount}</div>
              <div className="text-sm text-gray-600">Notifications enabled</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(enabledCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEnableAll}>
              Enable All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDisableAll}>
              Disable All
            </Button>
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-3">Delivery Methods</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-600">john.doe@example.com</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-gray-600">On this device</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">SMS</div>
                  <div className="text-sm text-gray-600">+91 9876543210</div>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        {notificationCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.title} className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{category.title}</h5>
                    <p className="text-sm text-gray-600">Manage {category.title.toLowerCase()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {category.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{setting.label}</div>
                        <div className="text-sm text-gray-600">{setting.description}</div>
                      </div>
                      <Switch
                        checked={notifications[setting.key as keyof typeof notifications]}
                        onCheckedChange={() => handleToggle(setting.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Schedule */}
      <div className="bg-white rounded-xl p-6 border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours Start
            </label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours End
            </label>
            <input
              type="time"
              defaultValue="07:00"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Notifications will be muted during quiet hours (except for important alerts)
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">Save Notification Settings</Button>
      </div>
    </div>
  );
}