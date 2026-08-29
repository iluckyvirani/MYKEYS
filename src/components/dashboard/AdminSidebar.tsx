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
  Briefcase,
  Package,
  Grid3x3,
  FileCheck,
  CreditCard,
  MessageSquare,
  Zap,
  BarChart2,
  LogsIcon,
  UserCog,
  FileText,
  HelpCircle,
  Building2,
  Wallet,
  Wrench,
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
  { name: "Agents", href: "/admin/dashboard/agents", icon: Briefcase },
  { name: "Service Providers", href: "/admin/dashboard/service-providers", icon: Package },
  { name: "Properties", href: "/admin/dashboard/properties", icon: Building },
  { name: "Bookings", href: "/admin/dashboard/bookings", icon: Calendar },
  { name: "Payments", href: "/admin/dashboard/payments", icon: CreditCard },
  { name: "Settle Up", href: "/admin/dashboard/settle-up", icon: Wallet },
  { name: "Packages", href: "/admin/dashboard/packages", icon: Package },
  { name: "Service Categories", href: "/admin/dashboard/categories", icon: Grid3x3 },
  { name: "Catalog Services", href: "/admin/dashboard/services", icon: Wrench },
  { name: "Site Content", href: "/admin/dashboard/content/home", icon: FileText },
  { name: "FAQs", href: "/admin/dashboard/faqs", icon: HelpCircle },
  { name: "Contact Departments", href: "/admin/dashboard/contact-departments", icon: Building2 },
  { name: "Amenities", href: "/admin/dashboard/amenities", icon: BarChart3 },
  { name: "Boosts / Bids", href: "/admin/dashboard/bids", icon: Zap },
  { name: "Documents", href: "/admin/dashboard/documents", icon: FileCheck },
  { name: "Property Doc Types", href: "/admin/dashboard/property-document-types", icon: FileCheck },
  { name: "Inquiries", href: "/admin/dashboard/inquiries", icon: MessageSquare },
  { name: "Reports", href: "/admin/dashboard/reports", icon: BarChart2 },
  { name: "Audit Logs", href: "/admin/dashboard/audit-logs", icon: LogsIcon },
  { name: "Team Management", href: "/admin/dashboard/team", icon: UserCog },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
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
              ADMIN
            </span>
          </Link>
        </div>

        {/* Navigation — scrollable on short laptop screens */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 py-2 space-y-1.5">
          {adminNavigation.map((item) => {
            const isActive =
              item.href === "/admin/dashboard/content/home"
                ? pathname.startsWith("/admin/dashboard/content")
                : pathname === item.href;
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
              <Key className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-spartan text-gray-900">
              ADMIN
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
          {adminNavigation.map((item) => {
            const isActive =
              item.href === "/admin/dashboard/content/home"
                ? pathname.startsWith("/admin/dashboard/content")
                : pathname === item.href;
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
