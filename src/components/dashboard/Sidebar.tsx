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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { api } from "@/lib/api";

interface SidebarProps {
  role: "user" | "owner" | "service";
  isOpen: boolean;
  onClose: () => void;
}

const userNavigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Bookings", href: "/user/dashboard/bookings", icon: Calendar },
  { name: "Service Bookings", href: "/user/dashboard/service-bookings", icon: Wrench },
  { name: "Inquiries", href: "/user/dashboard/inquiries", icon: MessageSquare },
  { name: "Favorites", href: "/user/dashboard/favorites", icon: Heart },
  { name: "Services", href: "/user/dashboard/services", icon: Megaphone },
  { name: "Payments", href: "/user/dashboard/payments", icon: CreditCard },
  // { name: "Documents", href: "/user/dashboard/documents", icon: FileText },
  { name: "Profile", href: "/user/dashboard/profile", icon: Settings },
];

const ownerNavigation = [
  { name: "Dashboard", href: "/owner/dashboard", icon: Home },
  { name: "Properties", href: "/owner/dashboard/properties", icon: Building },
  { name: "Bookings", href: "/owner/dashboard/bookings", icon: Calendar },
  { name: "Inquiries", href: "/owner/dashboard/inquiries", icon: MessageSquare },
  { name: "Services", href: "/owner/dashboard/services", icon: Megaphone },
  { name: "Payments", href: "/owner/dashboard/finance", icon: DollarSign },
  // { name: "Ads", href: "/owner/dashboard/ads", icon: Megaphone },
  { name: "Packages", href: "/owner/dashboard/packages", icon: Star },
  { name: "Reports", href: "/owner/dashboard/reports", icon: FileBarChart },
  { name: "Analytics", href: "/owner/dashboard/analytics", icon: BarChart3 },
];

const serviceNavigation = [
  { name: "Dashboard", href: "/service/dashboard", icon: Home },
  { name: "Bookings", href: "/service/dashboard/bookings", icon: Calendar },
  { name: "Requests", href: "/service/dashboard/requests", icon: MessageSquare },
  { name: "Services", href: "/service/dashboard/services", icon: Wrench },
  { name: "Earnings", href: "/service/dashboard/earnings", icon: DollarSign },
  { name: "Reviews", href: "/service/dashboard/reviews", icon: Star },
  { name: "Profile", href: "/service/dashboard/profile", icon: Settings },
];

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigation = 
    role === "user" ? userNavigation : 
    role === "service" ? serviceNavigation : 
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-50 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        {/* Logo */}
        <div className="flex items-center justify-center px-5 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-spartan text-gray-900">
              MYKEYS
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[5px] px-2 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto p-4 border-t">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-spartan text-gray-900">
              PropertyHub
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <nav className="mt-5 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout Button */}
        <div className="mt-auto p-4 border-t">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </>
  );
}