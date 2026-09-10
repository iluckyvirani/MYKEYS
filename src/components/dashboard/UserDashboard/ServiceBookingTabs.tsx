"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ServiceBookingCard from "./ServiceBookingCard";

interface ServiceBooking {
  id: string;
  serviceId: string;
  providerId: string;
  serviceName: string;
  providerName: string;
  providerImage?: string | null;
  status: "pending" | "confirmed" | "on-the-way" | "in-progress" | "completed" | "cancelled";
  trackingActive?: boolean;
  bookingType: "instant" | "schedule";
  scheduledDate?: string;
  scheduledTime?: string;
  totalAmount: number;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  review?: string;
  pendingAction?: "COMPLETE" | "CANCEL" | null;
}

interface ServiceBookingTabsProps {
  onBookingUpdated?: () => void;
  searchQuery?: string;
  filters?: {
    status?: string;
    bookingType?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
  };
}

export default function ServiceBookingTabs({ 
  onBookingUpdated,
  searchQuery = '',
  filters,
}: ServiceBookingTabsProps) {
  const [allBookings, setAllBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  const fetchBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Build query params — all filters sent to backend
      const params = new URLSearchParams({ limit: '20' });
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.bookingType && filters.bookingType !== 'all') {
        params.append('bookingType', filters.bookingType);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.sortBy && filters.sortBy !== 'recent') {
        if (filters.sortBy === 'oldest') {
          params.append('sortBy', 'createdAt');
          params.append('sortOrder', 'asc');
        } else if (filters.sortBy === 'amount-high' || filters.sortBy === 'amount-low') {
          params.append('sortBy', 'totalAmount');
          params.append('sortOrder', filters.sortBy === 'amount-high' ? 'desc' : 'asc');
        }
      }
      
      const response = await api.get(`/user/service-bookings?${params.toString()}`);
      
      if (response.data?.success) {
        const bookingsData = response.data.data?.items || response.data.data || [];
        
        if (!Array.isArray(bookingsData)) {
          console.error('Expected array but got:', typeof bookingsData, bookingsData);
          setAllBookings([]);
          setError('Invalid data format received');
          return;
        }
        
        setAllBookings(bookingsData);
        setError(null);
      } else {
        setAllBookings([]);
        throw new Error('Failed to fetch bookings');
      }
    } catch (err: any) {
      console.error("Error fetching service bookings:", err);
      setAllBookings([]);
      setError(err.response?.data?.message || err.message || "Failed to fetch service bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(false);
    const poll = setInterval(() => fetchBookings(true), 12000);
    return () => clearInterval(poll);
  }, [searchQuery, filters]);

  const handleBookingUpdated = (notice?: string) => {
    if (notice) setCompletionNotice(notice);
    fetchBookings();
    onBookingUpdated?.();
  };

  // Categorize bookings by status
  const upcomingBookings = allBookings.filter(
    (b) =>
      b.status === "pending" ||
      b.status === "confirmed" ||
      b.status === "on-the-way" ||
      b.status === "in-progress"
  );

  const completedBookings = allBookings.filter((b) => b.status === "completed");
  const cancelledBookings = allBookings.filter((b) => b.status === "cancelled");

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading your service bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[5px] border p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading bookings
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border">
      {completionNotice && (
        <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800">{completionNotice}</p>
        </div>
      )}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-6 pt-2 py-6">
          <TabsTrigger
            value="upcoming"
            className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Upcoming
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {upcomingBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Completed
            <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {completedBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            Cancelled
            <span className="ml-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {cancelledBookings.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="p-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No upcoming services
              </h3>
              <p className="text-gray-600">
                You don't have any upcoming service bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <ServiceBookingCard
                  key={booking.id}
                  booking={booking}
                  onBookingUpdated={handleBookingUpdated}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="p-6">
          {completedBookings.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No completed services
              </h3>
              <p className="text-gray-600">
                You don't have any completed service bookings yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedBookings.map((booking) => (
                <ServiceBookingCard
                  key={booking.id}
                  booking={booking}
                  onBookingUpdated={handleBookingUpdated}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cancelled Tab */}
        <TabsContent value="cancelled" className="p-6">
          {cancelledBookings.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No cancelled services
              </h3>
              <p className="text-gray-600">
                You don't have any cancelled bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelledBookings.map((booking) => (
                <ServiceBookingCard
                  key={booking.id}
                  booking={booking}
                  onBookingUpdated={handleBookingUpdated}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
