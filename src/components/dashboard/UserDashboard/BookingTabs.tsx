"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import BookingList from "./BookingList";

const upcomingBookings = [
  {
    id: "BK001",
    property: "Seaside Villa, Goa",
    type: "short_term",
    dates: "Jan 15 - Jan 22, 2024",
    checkIn: "2024-01-15",
    checkOut: "2024-01-22",
    amount: 45000,
    status: "confirmed",
    guests: 4,
    nights: 7,
    actions: ["cancel", "modify", "view"],
  },
  {
    id: "BK002",
    property: "Urban Apartment, Mumbai",
    type: "long_term",
    dates: "Feb 1 - Jul 31, 2024",
    checkIn: "2024-02-01",
    checkOut: "2024-07-31",
    amount: 150000,
    status: "pending",
    guests: 2,
    nights: 180,
    actions: ["cancel", "view"],
  },
];

const completedBookings = [
  {
    id: "BK003",
    property: "Mountain Cottage, Shimla",
    type: "short_term",
    dates: "Dec 20 - Dec 25, 2023",
    checkIn: "2023-12-20",
    checkOut: "2023-12-25",
    amount: 25000,
    status: "completed",
    guests: 3,
    nights: 5,
    actions: ["review", "rebook", "view"],
  },
];

const cancelledBookings = [
  {
    id: "BK004",
    property: "Luxury Penthouse, Delhi",
    type: "short_term",
    dates: "Jan 5 - Jan 10, 2024",
    checkIn: "2024-01-05",
    checkOut: "2024-01-10",
    amount: 35000,
    status: "cancelled",
    guests: 2,
    nights: 5,
    actions: ["rebook", "view"],
  },
];

export default function BookingTabs() {
  return (
    <div className="bg-white rounded-xl border">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-6 pt-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {upcomingBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
            <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {completedBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancelled
            <span className="ml-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {cancelledBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
            <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              0
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="upcoming" className="m-0">
            <BookingList 
              bookings={upcomingBookings} 
              emptyMessage="No upcoming bookings. Start exploring properties!"
              emptyAction={{ label: "Browse Properties", href: "/properties" }}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="m-0">
            <BookingList 
              bookings={completedBookings} 
              emptyMessage="No completed bookings yet."
              emptyAction={{ label: "View Upcoming", href: "#" }}
            />
          </TabsContent>
          
          <TabsContent value="cancelled" className="m-0">
            <BookingList 
              bookings={cancelledBookings} 
              emptyMessage="No cancelled bookings."
              emptyAction={{ label: "Browse Properties", href: "/properties" }}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="m-0">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending bookings</h3>
              <p className="text-gray-500">All your bookings are confirmed!</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}