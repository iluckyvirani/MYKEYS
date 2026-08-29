"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  MessageSquare,
  Heart,
  CreditCard,
  FileText,
  Settings,
  Building,
  BarChart3,
  DollarSign,
  Megaphone,
  Star,
  FileBarChart,
  LogOut,
  Key,
  Wrench,
  Bell,
  Zap,
  Wallet,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { api } from "@/lib/api";
import type { DashboardPanelRole } from "@/lib/dashboard/DashboardContext";

interface SidebarProps {
  role: DashboardPanelRole;
  isOpen: boolean;
  onClose: () => void;
}

const userNavigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Bookings", href: "/user/dashboard/bookings", icon: Calendar },
  { name: "Service Bookings", href: "/user/dashboard/service-bookings", icon: Wrench },
  { name: "Inquiries", href: "/user/dashboard/inquiries", icon: MessageSquare },
  { name: "Favorites", href: "/user/dashboard/favorites", icon: Heart },
  { name: "Saved searches", href: "/user/dashboard/saved-searches", icon: Bell },
  { name: "Diary", href: "/user/dashboard/diary", icon: BookOpen },
  { name: "Services", href: "/user/dashboard/services", icon: Megaphone },
  { name: "Payments", href: "/user/dashboard/payments", icon: CreditCard },
  // { name: "Documents", href: "/user/dashboard/documents", icon: FileText },
  { name: "Profile", href: "/user/dashboard/profile", icon: Settings },
];

const ownerNavigation = [
  { name: "Dashboard", href: "/owner/dashboard", icon: Home },
  { name: "Properties", href: "/owner/dashboard/properties", icon: Building },
  { name: "Rent Management", href: "/owner/dashboard/rent", icon: Key },
  { name: "Expenses", href: "/owner/dashboard/expenses", icon: Wallet },
  { name: "Diary", href: "/owner/dashboard/diary", icon: BookOpen },
  { name: "Bookings", href: "/owner/dashboard/bookings", icon: Calendar },
  { name: "Service Bookings", href: "/owner/dashboard/service-bookings", icon: Wrench },
  { name: "Inquiries", href: "/owner/dashboard/inquiries", icon: MessageSquare },
  { name: "Services", href: "/owner/dashboard/services", icon: Megaphone },
  { name: "Payments", href: "/owner/dashboard/finance", icon: DollarSign },
  // { name: "Ads", href: "/owner/dashboard/ads", icon: Megaphone },
  { name: "Packages", href: "/owner/dashboard/packages", icon: Star },
  { name: "Boosts", href: "/owner/dashboard/bids", icon: Zap },
  { name: "Reports", href: "/owner/dashboard/reports", icon: FileBarChart },
  { name: "Analytics", href: "/owner/dashboard/analytics", icon: BarChart3 },
  { name: "Profile", href: "/owner/dashboard/profile", icon: Settings },
];

const agentNavigation = [
  { name: "Dashboard", href: "/agent/dashboard", icon: Home },
  { name: "Properties", href: "/agent/dashboard/properties", icon: Building },
  { name: "Rent Management", href: "/agent/dashboard/rent", icon: Key },
  { name: "Expenses", href: "/agent/dashboard/expenses", icon: Wallet },
  { name: "Diary", href: "/agent/dashboard/diary", icon: BookOpen },
  { name: "Bookings", href: "/agent/dashboard/bookings", icon: Calendar },
  { name: "Service Bookings", href: "/agent/dashboard/service-bookings", icon: Wrench },
  { name: "Inquiries", href: "/agent/dashboard/inquiries", icon: MessageSquare },
  { name: "Services", href: "/agent/dashboard/services", icon: Megaphone },
  { name: "Payments", href: "/agent/dashboard/finance", icon: DollarSign },
  { name: "Packages", href: "/agent/dashboard/packages", icon: Star },
  { name: "Boosts", href: "/agent/dashboard/bids", icon: Zap },
  { name: "Reports", href: "/agent/dashboard/reports", icon: FileBarChart },
  { name: "Analytics", href: "/agent/dashboard/analytics", icon: BarChart3 },
  { name: "Profile", href: "/agent/dashboard/profile", icon: Settings },
];

const serviceNavigation = [
  { name: "Dashboard", href: "/service/dashboard", icon: Home },
  { name: "Bookings", href: "/service/dashboard/bookings", icon: Calendar },
  { name: "Services", href: "/service/dashboard/services", icon: Wrench },
  { name: "Earnings", href: "/service/dashboard/earnings", icon: DollarSign },
  { name: "Reviews", href: "/service/dashboard/reviews", icon: Star },
  { name: "Diary", href: "/service/dashboard/diary", icon: BookOpen },
  { name: "Notifications", href: "/service/dashboard/notifications", icon: Bell },
  { name: "Profile", href: "/service/dashboard/profile", icon: Settings },
];

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigation = 
    role === "user" ? userNavigation : 
    role === "service" ? serviceNavigation :
    role === "agent" ? agentNavigation :
    ownerNavigation;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call logout API
      await api.post("/auth/logout");
      
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear data and redirect even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        {/* Logo */}
        <div className="shrink-0 flex items-center justify-center px-5 py-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            aria-label="MYKEYS home"
          >
            <div className="w-9 h-9 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-spartan text-gray-900">
              MYKEYS
            </span>
          </Link>
        </div>

        {/* Navigation — scrollable on short laptop screens */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 py-2 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[5px] px-3 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-[1.375rem] h-[1.375rem] shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="shrink-0 p-4 border-t bg-white">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-[1.375rem] h-[1.375rem]" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="shrink-0 flex items-center justify-between p-4 border-b">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            aria-label="MYKEYS home"
          >
            <div className="w-9 h-9 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-spartan text-gray-900">
              MYKEYS
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 py-3 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-[1.375rem] h-[1.375rem] shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout Button */}
        <div className="shrink-0 p-4 border-t bg-white">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-[1.375rem] h-[1.375rem]" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </>
  );
}