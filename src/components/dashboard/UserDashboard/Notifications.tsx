// components/dashboard/UserDashboard/Notifications.tsx
"use client";

import { Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  priority?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

interface NotificationsProps {
  limit?: number;
  maxVisible?: number;
  showHeader?: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "booking":
    case "success":
      return CheckCircle;
    case "warning":
    case "payment":
      return AlertCircle;
    case "info":
    case "reminder":
    case "message":
      return Info;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "success":
    case "booking":
      return "bg-green-100 text-green-800 border-green-200";
    case "warning":
    case "payment":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "error":
      return "bg-red-100 text-red-800 border-red-200";
    case "info":
    case "reminder":
    case "message":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTimeAgo = (createdAt: string) => {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const diffMs = now.getTime() - notificationDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  
  return notificationDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

export default function Notifications({
  limit = 5,
  maxVisible = 4,
  showHeader = true,
}: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/notifications?limit=${limit}`);

        if (response.data?.notifications) {
          setNotifications(response.data.notifications);
          setError(null);
        } else {
          setNotifications([]);
        }
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "Failed to fetch notifications");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, isRead: true, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          isRead: true,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;
  const visibleNotifications = maxVisible
    ? notifications.slice(0, maxVisible)
    : notifications;

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border p-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-600">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="rounded-[5px]"
              >
                Mark all as read
              </Button>
            )}
            {/* <Button asChild variant="outline" size="sm" className="rounded-[5px]">
              <Link href="/dashboard/notifications">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button> */}
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => {
            const Icon = getNotificationIcon((notification.type || notification.category) as string);
            const isUnread = !notification.isRead && !notification.read;

            return (
              <div
                key={notification.id}
                className={`p-3 rounded-[5px] border transition-colors ${getNotificationColor(
                  (notification.type || notification.category) as string
                )} ${isUnread ? "border-l-4 border-l-blue-500 bg-opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isUnread ? "" : "opacity-60"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
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
      )}
    </div>
  );
}