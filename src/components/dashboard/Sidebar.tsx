"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "user" | "owner";
  isOpen: boolean;
  onClose: () => void;
}

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { name: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
  { name: "Favorites", href: "/dashboard/favorites", icon: Heart },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Profile", href: "/dashboard/profile", icon: Settings },
];

const ownerNavigation = [
  { name: "Dashboard", href: "/owner/owner-dashboard", icon: Home },
  { name: "Properties", href: "/owner/owner-dashboard/properties", icon: Building },
  { name: "Bookings", href: "/owner/owner-dashboard/bookings", icon: Calendar },
  { name: "Inquiries", href: "/owner/owner-dashboard/inquiries", icon: MessageSquare },
  { name: "Finance", href: "/owner/owner-dashboard/finance", icon: DollarSign },
  { name: "Ads", href: "/owner/owner-dashboard/ads", icon: Megaphone },
  { name: "Reviews", href: "/owner/owner-dashboard/reviews", icon: Star },
  { name: "Reports", href: "/owner/owner-dashboard/reports", icon: FileBarChart },
  { name: "Analytics", href: "/owner/owner-dashboard/analytics", icon: BarChart3 },
];

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navigation = role === "user" ? userNavigation : ownerNavigation;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-50 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        {/* Logo */}
        <div className="flex items-center justify-center px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-spartan text-gray-900">
              MYKEYS
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600"
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
          <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 flex items-center justify-center">
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
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}