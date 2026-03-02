"use client";

import { Users, Building, Calendar, CreditCard, BarChart2, FileCheck, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const quickActions = [
  {
    title: "View Users",
    description: "Manage all users",
    icon: Users,
    color: "bg-blue-500",
    href: "/admin/dashboard/users",
  },
  {
    title: "View Properties",
    description: "Manage properties",
    icon: Building,
    color: "bg-orange-500",
    href: "/admin/dashboard/properties",
  },
  {
    title: "View Bookings",
    description: "Check all bookings",
    icon: Calendar,
    color: "bg-purple-500",
    href: "/admin/dashboard/bookings",
  },
  {
    title: "View Payments",
    description: "Manage payments",
    icon: CreditCard,
    color: "bg-green-500",
    href: "/admin/dashboard/payments",
  },
  {
    title: "View Reports",
    description: "Analytics & reports",
    icon: BarChart2,
    color: "bg-indigo-500",
    href: "/admin/dashboard/reports",
  },
  {
    title: "View Inquiries",
    description: "User inquiries",
    icon: MessageSquare,
    color: "bg-pink-500",
    href: "/admin/dashboard/inquiries",
  },
  {
    title: "View Documents",
    description: "Pending documents",
    icon: FileCheck,
    color: "bg-amber-500",
    href: "/admin/dashboard/documents",
  },
  {
    title: "View Owners",
    description: "Manage owners",
    icon: Shield,
    color: "bg-cyan-500",
    href: "/admin/dashboard/owners",
  },
];

export default function AdminQuickActions() {
  return (
    <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-[5px] p-6 border border-green-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="h-auto w-full py-4 px-4 rounded-[5px] cursor-pointer flex flex-col items-center justify-center gap-2 bg-white hover:bg-white/90 border-gray-200"
              >
                <div className={`${action.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
