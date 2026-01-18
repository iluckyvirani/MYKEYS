// components/dashboard/UserDashboard/PaymentTabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import PaymentList from "./PaymentList";
import PaymentMethods from "./PaymentMethods";

const upcomingPayments = [
  {
    id: "PMT001",
    property: "Seaside Villa, Goa",
    type: "Security Deposit",
    dueDate: "2024-01-12",
    amount: 15000,
    status: "due_soon",
    paymentMethod: "Credit Card ****1234",
    canPayEarly: true,
  },
  {
    id: "PMT002",
    property: "Urban Apartment, Mumbai",
    type: "Monthly Rent",
    dueDate: "2024-01-05",
    amount: 30000,
    status: "due_today",
    paymentMethod: "UPI (Google Pay)",
    canPayEarly: false,
  },
];

const completedPayments = [
  {
    id: "PMT003",
    property: "Mountain Cottage, Shimla",
    type: "Full Payment",
    date: "2023-12-20",
    amount: 45000,
    status: "paid",
    paymentMethod: "Bank Transfer",
    reference: "TXN-789012",
  },
  {
    id: "PMT004",
    property: "Seaside Villa, Goa",
    type: "Cleaning Fee",
    date: "2023-12-15",
    amount: 1500,
    status: "paid",
    paymentMethod: "Credit Card ****1234",
    reference: "TXN-789011",
  },
];

const failedPayments = [
  {
    id: "PMT005",
    property: "Urban Apartment, Mumbai",
    type: "Security Deposit",
    dueDate: "2023-12-10",
    amount: 20000,
    status: "failed",
    paymentMethod: "Credit Card ****5678",
    retryDate: "2023-12-11",
    reason: "Insufficient funds",
  },
];

const refundedPayments = [
  {
    id: "PMT006",
    property: "Luxury Penthouse, Delhi",
    type: "Booking Amount",
    date: "2023-11-25",
    amount: 35000,
    status: "refunded",
    paymentMethod: "Credit Card ****1234",
    reference: "REF-456789",
    refundDate: "2023-11-28",
  },
];

export default function PaymentTabs() {
  return (
    <div className="bg-white rounded-[5px] border">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-6 pt-6 py-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <Clock className="w-4 h-4" />
            Upcoming
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {upcomingPayments.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <CheckCircle className="w-4 h-4" />
            Completed
            <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {completedPayments.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <XCircle className="w-4 h-4" />
            Failed
            <span className="ml-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {failedPayments.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="refunded" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <AlertCircle className="w-4 h-4" />
            Refunded
            <span className="ml-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
              {refundedPayments.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="methods" className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="upcoming" className="m-0">
            <PaymentList 
              payments={upcomingPayments}
              type="upcoming"
              emptyMessage="No upcoming payments"
            />
          </TabsContent>
          
          <TabsContent value="completed" className="m-0">
            <PaymentList 
              payments={completedPayments}
              type="completed"
              emptyMessage="No completed payments"
            />
          </TabsContent>
          
          <TabsContent value="failed" className="m-0">
            <PaymentList 
              payments={failedPayments}
              type="failed"
              emptyMessage="No failed payments"
            />
          </TabsContent>
          
          <TabsContent value="refunded" className="m-0">
            <PaymentList 
              payments={refundedPayments}
              type="refunded"
              emptyMessage="No refunded payments"
            />
          </TabsContent>
          
          <TabsContent value="methods" className="m-0">
            <PaymentMethods />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}