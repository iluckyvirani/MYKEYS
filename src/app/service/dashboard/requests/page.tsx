// app/service/dashboard/requests/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Clock, MapPin, User, DollarSign, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ServiceBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  location: string;
  description: string;
  amount: number;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  bookingType?: "instant" | "scheduled";
  paymentStatus: string;
  createdAt: string;
}

export default function ServiceRequestsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/service/bookings?limit=50");
        const data = res.data?.data;
        console.log("Service bookings response:", data);
        if (data) {
          // Handle both direct array and paginated response
          const items = Array.isArray(data) ? data : (data.items || []);
          setBookings(items);
        }
      } catch (err: any) {
        console.error("Failed to fetch bookings:", err);
        console.error("Error details:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleRespond = async (id: string, action: "accept" | "reject") => {
    try {
      const status = action === "accept" ? "confirmed" : "cancelled";
      await api.patch(`/service/bookings/${id}`, { status });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status } : b
        )
      );
      toast({
        title: "Success",
        description: `Booking ${action === "accept" ? "accepted" : "declined"} successfully`,
        variant: "default",
      });
    } catch (err: any) {
      console.error(`Failed to ${action} booking:`, err);
      toast({
        title: "Error",
        description: err.response?.data?.message || `Failed to ${action} booking`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterBookings = (status: string) => {
    return bookings.filter((b) => b.status === status);
  };

  const BookingCard = ({ booking }: { booking: ServiceBooking }) => {
    return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.service}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <User className="w-4 h-4" />
            {booking.clientName}
          </p>
          {booking.clientPhone && (
            <p className="text-xs text-gray-500 mt-1">📞 {booking.clientPhone}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{booking.description || "No description provided"}</p>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {booking.location || "Not specified"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(booking.date).toLocaleDateString()}
        </span>
        {booking.time && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {booking.time}
          </span>
        )}
        <span className={`text-xs px-2 py-1 rounded w-fit ${
          booking.paymentStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
        }`}>
          Payment: {booking.paymentStatus}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <p className="font-semibold text-gray-900 flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {booking.amount}
        </p>
        
        {booking.status === "pending" && (
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRespond(booking.id, "accept")}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleRespond(booking.id, "reject")}>
              <XCircle className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
    );
  };

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
        <p className="text-gray-600 mt-2">
          Review and manage service bookings from clients.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none p-0">
            <TabsTrigger value="pending" className="rounded-none">
              Pending ({filterBookings("pending").length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="rounded-none">
              Confirmed ({filterBookings("confirmed").length})
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
            ) : (
            <>
            <TabsContent value="pending" className="space-y-4">
              {filterBookings("pending").length > 0 ? (
                filterBookings("pending").map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No pending bookings</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {filterBookings("confirmed").length > 0 ? (
                filterBookings("confirmed").map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No confirmed bookings</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {filterBookings("cancelled").length > 0 ? (
                filterBookings("cancelled").map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No cancelled bookings</p>
                </div>
              )}
            </TabsContent>
            </>
            )}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
