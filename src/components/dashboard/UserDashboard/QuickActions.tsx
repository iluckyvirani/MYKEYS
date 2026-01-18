"use client";

import { Search, MessageSquare, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Search Properties",
    description: "Find your next stay",
    icon: Search,
    color: "bg-blue-500",
    href: "/properties",
  },
  {
    title: "Make Inquiry",
    description: "Contact property owners",
    icon: MessageSquare,
    color: "bg-green-500",
    href: "/inquiries/new",
  },
  {
    title: "View Bookings",
    description: "Check upcoming stays",
    icon: Calendar,
    color: "bg-purple-500",
    href: "/dashboard/bookings",
  },
  {
    title: "Make Payment",
    description: "Pay pending amounts",
    icon: CreditCard,
    color: "bg-orange-500",
    href: "/dashboard/payments",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-[5px] p-6 border border-green-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto py-4 px-4 rounded-[5px] cursor-pointer flex flex-col items-center justify-center gap-2 bg-white hover:bg-white/90 border-gray-200"
            >
              <div className={`${action.color} p-2 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}