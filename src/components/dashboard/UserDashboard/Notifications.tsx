// components/dashboard/UserDashboard/Notifications.tsx
"use client";

import { Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mockNotifications = [
  {
    id: "NOT001",
    title: "Booking Confirmed",
    message: "Your booking for Seaside Villa has been confirmed",
    time: "2 hours ago",
    type: "success",
    read: false,
  },
  {
    id: "NOT002",
    title: "Payment Reminder",
    message: "Payment of ₹25,000 due tomorrow for Urban Apartment",
    time: "5 hours ago",
    type: "warning",
    read: false,
  },
  {
    id: "NOT003",
    title: "New Message",
    message: "Rajesh Kumar replied to your inquiry",
    time: "1 day ago",
    type: "info",
    read: true,
  },
  {
    id: "NOT004",
    title: "Price Drop Alert",
    message: "Mountain View Cottage price reduced by 15%",
    time: "2 days ago",
    type: "info",
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return CheckCircle;
    case "warning":
      return AlertCircle;
    case "info":
      return Info;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-100 text-green-800 border-green-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.slice(0, 4).map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          
          return (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${getNotificationColor(
                notification.type
              )} ${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${notification.read ? "opacity-70" : ""}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {notification.time}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      )}
    </div>
  );
}