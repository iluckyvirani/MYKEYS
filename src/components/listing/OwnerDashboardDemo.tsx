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
  CreditCard
} from "lucide-react";

export default function OwnerDashboardDemo() {
  const [activeTab, setActiveTab] = useState("properties");

  const dashboardTabs = [
    { id: "properties", label: "My Properties", icon: <Home className="w-4 h-4" /> },
    { id: "bookings", label: "Bookings", icon: <Calendar className="w-4 h-4" /> },
    { id: "inquiries", label: "Inquiries", icon: <MessageCircle className="w-4 h-4" /> },
    { id: "earnings", label: "Earnings", icon: <DollarSign className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

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
        </div>

        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Dashboard Header */}
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Owner Dashboard</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="relative">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 border-r border-gray-700 p-6">
              <nav className="space-y-2">
                {dashboardTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-500"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                
                <div className="pt-6 mt-6 border-t border-gray-700">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">Billing</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Earnings</p>
                      <p className="text-2xl font-bold text-white mt-2">£12,450</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-emerald-400 text-sm mt-2">+24% from last month</p>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Properties</p>
                      <p className="text-2xl font-bold text-white mt-2">5</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Home className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-blue-400 text-sm mt-2">3 Short Rent, 2 Long Rent</p>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">New Inquiries</p>
                      <p className="text-2xl font-bold text-white mt-2">18</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                  <p className="text-orange-400 text-sm mt-2">12 today, 6 yesterday</p>
                </div>
              </div>

              {/* Properties Table */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">My Properties</h3>
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium">
                    + Add New Property
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 text-gray-400 font-medium">Property</th>
                        <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                        <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 text-gray-400 font-medium">Earnings</th>
                        <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                            <div>
                              <p className="font-medium text-white">Canary Wharf Apartment</p>
                              <p className="text-sm text-gray-400">London E14</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            Short Rent
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                            Active
                          </span>
                        </td>
                        <td className="py-4">
                          <p className="font-medium text-white">£2,850</p>
                          <p className="text-sm text-gray-400">This month</p>
                        </td>
                        <td className="py-4">
                          <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                            Manage
                          </button>
                        </td>
                      </tr>
                      
                      <tr>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                            <div>
                              <p className="font-medium text-white">Kensington Villa</p>
                              <p className="text-sm text-gray-400">London W8</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                            Long Rent
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                            Active
                          </span>
                        </td>
                        <td className="py-4">
                          <p className="font-medium text-white">£3,200</p>
                          <p className="text-sm text-gray-400">Monthly</p>
                        </td>
                        <td className="py-4">
                          <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                            Manage
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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