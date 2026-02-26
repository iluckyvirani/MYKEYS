"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Building,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Key,
  Shield,
  Package,
  Grid3x3,
  FileCheck,
  CreditCard,
  MessageSquare,
  Zap,
  BarChart2,
  LogsIcon,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAdminLogout } from "@/lib/hooks/useAdmin";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Owners", href: "/admin/dashboard/owners", icon: Shield },
  { name: "Service Providers", href: "/admin/dashboard/service-providers", icon: Package },
  { name: "Properties", href: "/admin/dashboard/properties", icon: Building },
  { name: "Bookings", href: "/admin/dashboard/bookings", icon: Calendar },
  { name: "Payments", href: "/admin/dashboard/payments", icon: CreditCard },
  { name: "Packages", href: "/admin/dashboard/packages", icon: Package },
  { name: "Service Listings", href: "/admin/dashboard/services", icon: Grid3x3 },
  { name: "Service Categories", href: "/admin/dashboard/categories", icon: Grid3x3 },
  { name: "Amenities", href: "/admin/dashboard/amenities", icon: BarChart3 },
  { name: "Ads & Campaigns", href: "/admin/dashboard/ads", icon: Zap },
  { name: "Documents", href: "/admin/dashboard/documents", icon: FileCheck },
  { name: "Inquiries", href: "/admin/dashboard/inquiries", icon: MessageSquare },
  { name: "Reports", href: "/admin/dashboard/reports", icon: BarChart2 },
  { name: "Audit Logs", href: "/admin/dashboard/audit-logs", icon: LogsIcon },
  { name: "Team Management", href: "/admin/dashboard/team", icon: UserCog },
  { name: "Profile", href: "/admin/dashboard/profile", icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAdminLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        {/* Logo */}
        <div className="flex items-center justify-center px-5 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-spartan text-gray-900">
              ADMIN
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-2 px-4">
          {adminNavigation.map((item) => {
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
              <Key className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-spartan text-gray-900">
              ADMIN
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
          {adminNavigation.map((item) => {
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
