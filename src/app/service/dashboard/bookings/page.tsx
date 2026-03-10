// app/service/dashboard/bookings/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "@/lib/api";

interface ServiceBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  amount: number;
  description: string;
}

export default function ServiceBookingsPage() {
  const [allBookings, setAllBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/service/bookings?limit=50&sortBy=createdAt&sortOrder=desc");
        const data = res.data?.data?.items;
        if (data) {
          setAllBookings(data);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    const badgeStyles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return badgeStyles[status] || "bg-gray-100 text-gray-800";
  };

  const filterBookings = (status: string) => {
    return allBookings.filter((b) => b.status === status);
  };

  const BookingCard = ({ booking }: { booking: ServiceBooking }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.service}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <User className="w-4 h-4" />
            {booking.clientName}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
            booking.status
          )}`}
        >
          {booking.status.charAt(0).toUpperCase() +
            booking.status.slice(1).replace("-", " ")}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{booking.description}</p>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(booking.date).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {booking.time}
        </span>
        <span className="flex items-center gap-1 col-span-2">
          <MapPin className="w-4 h-4" />
          {booking.location}
        </span>
        <span className="flex items-center gap-1">
          <Phone className="w-4 h-4" />
          {booking.clientPhone}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <p className="font-semibold text-gray-900">₹{booking.amount}</p>
        <div className="flex gap-2">
          {/* <Link href={`/service/dashboard/bookings/${booking.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </Link> */}
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-1" />
            Invoice
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
        <p className="text-gray-600 mt-2">
          Manage all your service bookings and track their status.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none p-0">
            <TabsTrigger value="all" className="rounded-none">
              All ({allBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-none">
              Pending ({filterBookings("pending").length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="rounded-none">
              Confirmed ({filterBookings("confirmed").length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-none">
              In Progress ({filterBookings("in-progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-none">
              Completed ({filterBookings("completed").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-none">
              Cancelled ({filterBookings("cancelled").length})
            </TabsTrigger>
          </TabsList>

          <div className="p-5">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading bookings...</p>
              </div>
            ) : allBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No bookings found</p>
              </div>
            ) : (
            <>
            <TabsContent value="all" className="space-y-4">
              {allBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {filterBookings("pending").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {filterBookings("confirmed").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-4">
              {filterBookings("in-progress").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {filterBookings("completed").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {filterBookings("cancelled").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </TabsContent>
            </>
            )}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
