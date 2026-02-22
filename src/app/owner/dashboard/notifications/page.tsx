"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Check } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications?limit=1000");
      const data = response.data?.data?.items || response.data?.notifications || [];
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "unread") return !notif.isRead;
    if (activeTab === "read") return notif.isRead;
    return true;
  });

  const handleMarkAllAsRead = async () => {
    try {
      setMarking(true);
      await api.patch("/notifications/read-all");
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setMarking(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete("/notifications");
      setNotifications([]);
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getTimeAgo = (date: string) => {
    const past = new Date(date);
    const now = new Date();
    const diff = now.getTime() - past.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-600">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleMarkAllAsRead}
              disabled={marking || notifications.every((n) => n.isRead)}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              <Check className="w-4 h-4 mr-2" />
              {marking ? "Reading..." : "Read All"}
            </Button>
            <Button
              onClick={handleDeleteAll}
              disabled={deleting || notifications.length === 0}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          All{" "}
          <span className="ml-2 font-bold text-gray-700">
            {notifications.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "unread"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Unread
          <span className="ml-2 font-bold text-gray-700">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("read")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "read"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Read
          <span className="ml-2 font-bold text-gray-700">
            {notifications.filter((n) => n.isRead).length}
          </span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No notifications
            </h3>
            <p className="text-gray-600 text-center">
              {activeTab === "unread"
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex gap-4 items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.isRead
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Bell
                        className={`w-5 h-5 ${
                          !notification.isRead
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-gray-900 ${
                            !notification.isRead ? "font-bold" : ""
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <Button
                            onClick={() => handleMarkAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
