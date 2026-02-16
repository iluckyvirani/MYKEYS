// components/dashboard/OwnerDashboard/QuickActions.tsx
"use client";

import { PlusCircle, Calendar, MessageSquare, BarChart3, DollarSign, Settings, Users, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const quickActions = [
  {
    title: "Add New Property",
    description: "List a new property for rent or sale",
    icon: PlusCircle,
    color: "bg-green-500",
    href: "/owner/dashboard/properties/add",
  },
  {
    title: "Manage Bookings",
    description: "View and manage all bookings",
    icon: Calendar,
    color: "bg-blue-500",
    href: "/owner/dashboard/bookings",
  },
  {
    title: "Respond to Inquiries",
    description: "Reply to pending inquiries",
    icon: MessageSquare,
    color: "bg-orange-500",
    href: "/owner/dashboard/inquiries",
  },
  {
    title: "View Analytics",
    description: "Check performance metrics",
    icon: BarChart3,
    color: "bg-purple-500",
    href: "/owner/dashboard/analytics",
  },
  {
    title: "Manage Payouts",
    description: "Withdraw earnings",
    icon: DollarSign,
    color: "bg-emerald-500",
    href: "/owner/dashboard/finance",
  },
  {
    title: "Run Ads",
    description: "Boost property visibility",
    icon: Megaphone,
    color: "bg-pink-500",
    href: "/owner/dashboard/ads",
  },
  {
    title: "View Reports",
    description: "Access detailed reports",
    icon: BarChart3,
    color: "bg-indigo-500",
    href: "/owner/dashboard/reports",
  },
  {
    title: "Manage Reviews",
    description: "Respond to reviews",
    icon: MessageSquare,
    color: "bg-yellow-500",
    href: "/owner/dashboard/reviews",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-[5px] p-5 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-500 mt-1">
            Quickly access frequently used features
          </p>
        </div>
        {/* <Button variant="outline" size="sm">
          Customize
        </Button> */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 bg-white hover:bg-white/90 border-gray-200 group w-full"
              >
                <div className={`${action.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-xs md:text-sm line-clamp-2">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block line-clamp-2">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}