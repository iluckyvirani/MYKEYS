"use client";

import { useState } from "react";
import {
  Home,
  DollarSign,
  MessageCircle,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Star,
  Zap,
  Package,
} from "lucide-react";

type TabId = "properties" | "bookings" | "inquiries" | "earnings" | "analytics";

const DEMO_PROPERTIES = [
  {
    id: "1",
    title: "Canary Wharf Apartment",
    location: "London E14",
    type: "Short Rent",
    typeColor: "bg-blue-500/20 text-blue-400",
    status: "Active",
    earnings: "£2,850",
    earningsNote: "This month",
  },
  {
    id: "2",
    title: "Kensington Villa",
    location: "London W8",
    type: "Long Rent",
    typeColor: "bg-orange-500/20 text-orange-400",
    status: "Active",
    earnings: "£3,200",
    earningsNote: "Monthly",
  },
  {
    id: "3",
    title: "Shoreditch Studio",
    location: "London E1",
    type: "Short Rent",
    typeColor: "bg-blue-500/20 text-blue-400",
    status: "Pending",
    earnings: "£980",
    earningsNote: "This month",
  },
];

const DEMO_BOOKINGS = [
  { id: "B-1042", guest: "Sarah Mitchell", property: "Canary Wharf Apartment", dates: "12–18 Jun 2026", amount: "£840", status: "Confirmed" },
  { id: "B-1041", guest: "James Wilson", property: "Shoreditch Studio", dates: "5–8 Jun 2026", amount: "£285", status: "Checked in" },
  { id: "B-1038", guest: "Emma Thompson", property: "Kensington Villa", dates: "1 Jun – 1 Jul 2026", amount: "£3,200", status: "Confirmed" },
  { id: "B-1035", guest: "Oliver Brown", property: "Canary Wharf Apartment", dates: "20–25 May 2026", amount: "£700", status: "Completed" },
];

const DEMO_INQUIRIES = [
  { id: "INQ-88", name: "Priya Sharma", property: "Canary Wharf Apartment", message: "Is early check-in available?", time: "2h ago", priority: "High" },
  { id: "INQ-87", name: "Michael Chen", property: "Kensington Villa", message: "Interested in 12-month lease", time: "5h ago", priority: "Medium" },
  { id: "INQ-86", name: "Lisa Anderson", property: "Shoreditch Studio", message: "Can I bring a small dog?", time: "Yesterday", priority: "Low" },
];

const DEMO_EARNINGS = [
  { id: "P-501", date: "28 May 2026", source: "Booking B-1042", gross: "£840", commission: "£84", net: "£756" },
  { id: "P-498", date: "22 May 2026", source: "Booking B-1035", gross: "£700", commission: "£70", net: "£630" },
  { id: "P-495", date: "15 May 2026", source: "Booking B-1030", gross: "£1,200", commission: "£120", net: "£1,080" },
];

const DEMO_MONTHLY = [
  { month: "Jan", revenue: 8200, occupancy: 68 },
  { month: "Feb", revenue: 9100, occupancy: 72 },
  { month: "Mar", revenue: 10500, occupancy: 78 },
  { month: "Apr", revenue: 11200, occupancy: 81 },
  { month: "May", revenue: 12450, occupancy: 85 },
];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400",
  Pending: "bg-yellow-500/20 text-yellow-400",
  Confirmed: "bg-emerald-500/20 text-emerald-400",
  "Checked in": "bg-blue-500/20 text-blue-400",
  Completed: "bg-gray-500/20 text-gray-300",
  High: "bg-red-500/20 text-red-400",
  Medium: "bg-orange-500/20 text-orange-400",
  Low: "bg-gray-500/20 text-gray-400",
};

export default function OwnerDashboardDemo() {
  const [activeTab, setActiveTab] = useState<TabId>("properties");

  const dashboardTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "properties", label: "My Properties", icon: <Home className="w-4 h-4" /> },
    { id: "bookings", label: "Bookings", icon: <Calendar className="w-4 h-4" /> },
    { id: "inquiries", label: "Inquiries", icon: <MessageCircle className="w-4 h-4" /> },
    { id: "earnings", label: "Earnings", icon: <DollarSign className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const tabStats: Record<TabId, { label: string; value: string; sub: string; icon: React.ReactNode; accent: string }[]> = {
    properties: [
      { label: "Total Earnings", value: "£12,450", sub: "+24% from last month", icon: <DollarSign className="w-6 h-6 text-emerald-400" />, accent: "bg-emerald-500/20" },
      { label: "Active Properties", value: "5", sub: "3 Short Rent, 2 Long Rent", icon: <Home className="w-6 h-6 text-blue-400" />, accent: "bg-blue-500/20" },
      { label: "New Inquiries", value: "18", sub: "12 today, 6 yesterday", icon: <MessageCircle className="w-6 h-6 text-orange-400" />, accent: "bg-orange-500/20" },
    ],
    bookings: [
      { label: "Active Bookings", value: "7", sub: "3 checking in this week", icon: <Calendar className="w-6 h-6 text-blue-400" />, accent: "bg-blue-500/20" },
      { label: "This Month", value: "24", sub: "+6 vs last month", icon: <TrendingUp className="w-6 h-6 text-emerald-400" />, accent: "bg-emerald-500/20" },
      { label: "Occupancy", value: "85%", sub: "Across all properties", icon: <Home className="w-6 h-6 text-purple-400" />, accent: "bg-purple-500/20" },
    ],
    inquiries: [
      { label: "Open Inquiries", value: "18", sub: "5 need response today", icon: <MessageCircle className="w-6 h-6 text-orange-400" />, accent: "bg-orange-500/20" },
      { label: "Avg Response", value: "2.4h", sub: "-0.5h vs last week", icon: <Bell className="w-6 h-6 text-blue-400" />, accent: "bg-blue-500/20" },
      { label: "Conversion", value: "32%", sub: "Inquiry to booking", icon: <TrendingUp className="w-6 h-6 text-emerald-400" />, accent: "bg-emerald-500/20" },
    ],
    earnings: [
      { label: "Net Earnings", value: "£11,205", sub: "After 10% commission", icon: <DollarSign className="w-6 h-6 text-emerald-400" />, accent: "bg-emerald-500/20" },
      { label: "Pending Payout", value: "£1,245", sub: "2 bookings processing", icon: <CreditCard className="w-6 h-6 text-yellow-400" />, accent: "bg-yellow-500/20" },
      { label: "Package Spend", value: "£49", sub: "Professional plan", icon: <Package className="w-6 h-6 text-purple-400" />, accent: "bg-purple-500/20" },
    ],
    analytics: [
      { label: "Booking Revenue", value: "£12,450", sub: "+24% this period", icon: <DollarSign className="w-6 h-6 text-emerald-400" />, accent: "bg-emerald-500/20" },
      { label: "Repeat Guests", value: "42%", sub: "12 returning guests", icon: <Users className="w-6 h-6 text-pink-400" />, accent: "bg-pink-500/20" },
      { label: "Avg Rating", value: "4.8", sub: "124 reviews", icon: <Star className="w-6 h-6 text-yellow-400" />, accent: "bg-yellow-500/20" },
    ],
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "properties":
        return (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">My Properties</h3>
              <span className="px-4 py-2 bg-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium cursor-default">
                + Add New Property
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 font-medium">Property</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_PROPERTIES.map((p) => (
                    <tr key={p.id} className="border-b border-gray-700/50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg shrink-0" />
                          <div>
                            <p className="font-medium text-white">{p.title}</p>
                            <p className="text-sm text-gray-400">{p.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${p.typeColor}`}>{p.type}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="py-4">
                        <p className="font-medium text-white">{p.earnings}</p>
                        <p className="text-sm text-gray-400">{p.earningsNote}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "bookings":
        return (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Bookings</h3>
            <div className="space-y-3">
              {DEMO_BOOKINGS.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                >
                  <div>
                    <p className="font-medium text-white">{b.guest}</p>
                    <p className="text-sm text-gray-400">{b.property}</p>
                    <p className="text-xs text-gray-500 mt-1">{b.dates}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-emerald-400">{b.amount}</span>
                    <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "inquiries":
        return (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Inquiry Inbox</h3>
            <div className="space-y-3">
              {DEMO_INQUIRIES.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-emerald-500/30 transition-colors cursor-default"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-white">{inq.name}</p>
                      <p className="text-sm text-gray-400">{inq.property}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[inq.priority]}`}>{inq.priority}</span>
                      <span className="text-xs text-gray-500">{inq.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{inq.message}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "earnings":
        return (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Source</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Gross</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Commission</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Your earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_EARNINGS.map((row) => (
                    <tr key={row.id} className="border-b border-gray-700/50 last:border-0">
                      <td className="py-3 text-gray-300 text-sm">{row.date}</td>
                      <td className="py-3 text-white text-sm">{row.source}</td>
                      <td className="py-3 text-right text-gray-300">{row.gross}</td>
                      <td className="py-3 text-right text-red-400/80">{row.commission}</td>
                      <td className="py-3 text-right font-medium text-emerald-400">{row.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Revenue & occupancy (demo)</h3>
              <div className="space-y-4">
                {DEMO_MONTHLY.map((m) => (
                  <div key={m.month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 font-medium">{m.month} 2026</span>
                      <span className="text-gray-400">
                        £{(m.revenue / 1000).toFixed(1)}k · {m.occupancy}% occupancy
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        style={{ width: `${m.occupancy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-white">Boost spend</span>
                </div>
                <p className="text-2xl font-bold text-white">£186</p>
                <p className="text-xs text-gray-400 mt-1">2 active boosts · Canary Wharf</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Package</span>
                </div>
                <p className="text-2xl font-bold text-white">Professional</p>
                <p className="text-xs text-gray-400 mt-1">5 / 10 listings used</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful Owner Dashboard
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to manage your properties in one place
          </p>
          <p className="text-sm text-emerald-400/90 mt-3">
            Interactive preview — click the sidebar tabs to explore
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Owner Dashboard</span>
                <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">Demo</span>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" className="relative cursor-default" aria-hidden>
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <div className="w-8 h-8 bg-gray-700 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-64 bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-700 p-4 lg:p-6">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {dashboardTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-500"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium whitespace-nowrap">{tab.label}</span>
                  </button>
                ))}
              </nav>
              <div className="hidden lg:block pt-6 mt-6 border-t border-gray-700 space-y-1">
                <div className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 rounded-lg text-sm">
                  <Settings className="w-4 h-4" />
                  Settings
                </div>
                <div className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 rounded-lg text-sm">
                  <CreditCard className="w-4 h-4" />
                  Billing
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 lg:p-8 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {tabStats[activeTab].map((stat) => (
                  <div key={stat.label} className="bg-gray-800 rounded-xl p-5 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-xl lg:text-2xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-11 h-11 lg:w-12 lg:h-12 ${stat.accent} rounded-lg flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                    </div>
                    <p className="text-emerald-400/90 text-xs lg:text-sm mt-2">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {renderTabContent()}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/5 rounded-xl">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Smart Calendar</h4>
            <p className="text-gray-400">Sync bookings, block dates, and manage availability easily.</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Document Management</h4>
            <p className="text-gray-400">Store contracts, IDs, and property documents securely.</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Guest Management</h4>
            <p className="text-gray-400">Track guest details, communication, and preferences.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
