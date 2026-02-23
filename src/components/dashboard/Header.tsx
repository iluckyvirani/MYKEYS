"use client";

import { Bell, Search, Menu, User, Home, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Notifications from "@/components/dashboard/UserDashboard/Notifications";

interface HeaderProps {
  role: "user" | "owner" | "service";
  onMenuClick: () => void;
  onRoleChange: (role: "user" | "owner" | "service") => void;
}

interface Notification {
  id: string;
  isRead?: boolean;
  read?: boolean;
}

export default function Header({ role, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    fetchUnreadNotifications();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get<MeResponse>("/auth/me");
      if (response.data) {
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // If unauthorized, redirect to login
      if ((error as any)?.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get("/notifications?limit=100");
      const notifications: Notification[] =
        response.data?.notifications || response.data?.data?.items || [];
      if (notifications.length > 0) {
        const unread = notifications.filter((n) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Loading...";
  const userRole = user?.roles?.includes("OWNER") ? "Property Owner" : "Tenant";

  return (
    <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button and Search */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Go to home page"
            >
              <Link href="/">
                <Home className="w-5 h-5" />
              </Link>
            </Button>

            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search bookings, properties, or inquiries..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Right: Notifications and User */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative cursor-pointer"
              onClick={() => router.push(`/${role}/dashboard/notifications`)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            <div className="h-8 w-px bg-gray-200"></div>

            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              </Button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{userRole}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}