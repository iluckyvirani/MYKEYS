"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import BookingList from "./BookingList";
import { ShortBookingDTO, BookingStatus } from "@/types/bookings";

interface BookingTabsProps {
  searchQuery?: string;
  filters?: {
    status?: string;
    paymentStatus?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
  };
}

export default function BookingTabs({ searchQuery = '', filters }: BookingTabsProps) {
  const [allBookings, setAllBookings] = useState<ShortBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: '20' });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters?.fromDate) params.append('from', filters.fromDate);
      if (filters?.toDate) params.append('to', filters.toDate);
      if (filters?.sortBy && filters.sortBy !== 'recent') {
        if (filters.sortBy === 'oldest') { params.append('sortBy', 'createdAt'); params.append('sortOrder', 'asc'); }
        else if (filters.sortBy === 'amount-high') { params.append('sortBy', 'totalAmount'); params.append('sortOrder', 'desc'); }
        else if (filters.sortBy === 'amount-low') { params.append('sortBy', 'totalAmount'); params.append('sortOrder', 'asc'); }
        else if (filters.sortBy === 'checkin') { params.append('sortBy', 'checkIn'); params.append('sortOrder', 'asc'); }
      }
      const response = await api.get(`/bookings?${params.toString()}`);

      if (response.data?.success && response.data.data?.items) {
        setAllBookings(response.data.data.items);
        setError(null);
      } else {
        setError("Failed to load bookings");
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [searchQuery, filters]);

  // Reload bookings when a booking is updated
  const handleBookingUpdated = () => {
    fetchBookings();
  };

  // Categorize bookings by status
  const upcomingBookings = allBookings.filter(
    (b) => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
  );

  const completedBookings = allBookings.filter(
    (b) => b.status === BookingStatus.COMPLETED
  );

  const cancelledBookings = allBookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  );

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading bookings</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-6 pt-2  py-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
            <Calendar className="w-4 h-4" />
            Upcoming
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {upcomingBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
            <CheckCircle className="w-4 h-4" />
            Completed
            <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {completedBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
            <XCircle className="w-4 h-4" />
            Cancelled
            <span className="ml-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {cancelledBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
            <Clock className="w-4 h-4" />
            All Bookings
            <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              {allBookings.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="upcoming" className="m-0">
            <BookingList 
              bookings={upcomingBookings} 
              emptyMessage="No upcoming bookings. Start exploring properties!"
              emptyAction={{ label: "Browse Properties", href: "/properties" }}
              onBookingUpdated={handleBookingUpdated}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="m-0">
            <BookingList 
              bookings={completedBookings} 
              emptyMessage="No completed bookings yet."
              emptyAction={{ label: "View Upcoming", href: "#" }}
              onBookingUpdated={handleBookingUpdated}
            />
          </TabsContent>
          
          <TabsContent value="cancelled" className="m-0">
            <BookingList 
              bookings={cancelledBookings} 
              emptyMessage="No cancelled bookings."
              emptyAction={{ label: "Browse Properties", href: "/" }}
              onBookingUpdated={handleBookingUpdated}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="m-0">
            <BookingList 
              bookings={allBookings} 
              emptyMessage="No bookings found."
              emptyAction={{ label: "Browse Properties", href: "/" }}
              onBookingUpdated={handleBookingUpdated}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}