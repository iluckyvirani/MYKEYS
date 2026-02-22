"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  Star,
  User,
  Calendar,
  Phone,
  MessageSquare,
  Download,
  Eye,
  Zap,
  CheckCircle,
  X,
} from "lucide-react";

interface ServiceBooking {
  id: string;
  serviceName: string;
  providerName: string;
  providerImage?: string;
  providerRating: number;
  date: string;
  time: string;
  status: "confirmed" | "in-progress" | "completed" | "cancelled";
  bookingType: "instant" | "scheduled";
  amount: number;
  rating?: number;
}

// Mock data
const mockBookings: ServiceBooking[] = [
  {
    id: "BK001",
    serviceName: "Plumbing - Pipe Repair",
    providerName: "Raj Kumar",
    providerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    providerRating: 4.8,
    date: "2026-02-16",
    time: "10:00 AM",
    status: "completed",
    bookingType: "scheduled",
    amount: 500,
    rating: 5,
  },
  {
    id: "BK002",
    serviceName: "Cleaning - Home Cleaning",
    providerName: "Priya Sharma",
    providerImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    providerRating: 4.9,
    date: "2026-02-17",
    time: "02:00 PM",
    status: "confirmed",
    bookingType: "instant",
    amount: 300,
  },
  {
    id: "BK003",
    serviceName: "AC Repair - Maintenance",
    providerName: "Vikram Singh",
    providerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    providerRating: 4.7,
    date: "2026-02-18",
    time: "03:30 PM",
    status: "in-progress",
    bookingType: "scheduled",
    amount: 800,
  },
];

export default function UserServiceDashboard() {
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "cancelled">(
    "active"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <Zap className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredBookings = mockBookings.filter((booking) => {
    if (activeTab === "active") return booking.status !== "completed" && booking.status !== "cancelled";
    if (activeTab === "completed") return booking.status === "completed";
    if (activeTab === "cancelled") return booking.status === "cancelled";
    return false;
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Services</h1>
          <p className="text-gray-600">Manage and track all your service bookings</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Active Bookings",
              value: mockBookings.filter((b) => b.status !== "completed" && b.status !== "cancelled")
                .length,
              color: "blue",
            },
            {
              label: "Completed",
              value: mockBookings.filter((b) => b.status === "completed").length,
              color: "green",
            },
            {
              label: "Total Amount Spent",
              value: `₹${mockBookings.reduce((sum, b) => sum + b.amount, 0)}`,
              color: "purple",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`border-l-4 border-l-green-600`}>
                <CardContent className="pt-6">
                  <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No bookings in this category</p>
                  </div>
                ) : (
                  filteredBookings.map((booking, idx) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Provider Info */}
                        <div className="md:col-span-3 flex items-start gap-3">
                          <img
                            src={booking.providerImage}
                            alt={booking.providerName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{booking.providerName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-gray-600">
                                {booking.providerRating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="md:col-span-4">
                          <p className="font-semibold text-gray-900">{booking.serviceName}</p>
                          <div className="flex flex-col gap-2 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {booking.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </div>
                          </div>
                        </div>

                        {/* Status & Amount */}
                        <div className="md:col-span-3 flex flex-col gap-2">
                          <Badge className={`w-fit flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status}</span>
                          </Badge>
                          <p className="font-bold text-lg text-gray-900">₹{booking.amount}</p>
                          <Badge className="w-fit bg-gray-100 text-gray-800 capitalize">
                            {booking.bookingType}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-2 flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 md:flex-auto flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          {booking.status === "completed" && !booking.rating && (
                    <Button
                      size="sm"
                      className="flex-1 md:flex-auto bg-green-600 hover:bg-green-700 flex items-center gap-1"
                    >
                              <Star className="w-4 h-4" />
                              Rate
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Rating Display */}
                      {booking.rating && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < booking.rating!
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
