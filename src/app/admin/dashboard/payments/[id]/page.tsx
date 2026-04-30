"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Building2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  booking?: {
    id: string;
    checkIn: string;
    checkOut: string;
    property: {
      id: string;
      title: string;
    };
  };
  package?: {
    id: string;
    package: {
      name: string;
      price: number;
    };
  };
}

export default function PaymentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const resolvedParams = await params;
        const response = await api.get(`/admin/payments/${resolvedParams.id}`);
        if (response.data?.success) {
          setPayment(response.data.data);
          setNewStatus(response.data.data.status);
        } else {
          setError("Payment not found");
        }
      } catch (err) {
        console.error("Error fetching payment:", err);
        setError("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [params]);

  const handleStatusUpdate = async () => {
    if (!payment || !newStatus) return;

    try {
      const response = await api.patch(`/admin/payments/${payment.id}`, {
        status: newStatus,
      });

      if (response.data?.success) {
        setPayment(response.data.data);
        setEditingStatus(false);
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      alert("Failed to update payment status");
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center text-gray-500">Loading payment details...</div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error || !payment) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              Transaction ID: {payment.transactionId}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="text-sm text-gray-600 mb-2">Amount</div>
            <div className="text-2xl font-bold text-gray-900">
              £{payment.amount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-2">{payment.currency}</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="text-sm text-gray-600 mb-2">Payment Method</div>
            <div className="text-xl font-bold text-gray-900">{payment.paymentMethod}</div>
            <div className="text-xs text-gray-500 mt-2">Razorpay</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="text-sm text-gray-600 mb-2">Status</div>
            <Badge className={getStatusColor(payment.status)}>
              {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1).toLowerCase()}
            </Badge>
            <div className="text-xs text-gray-500 mt-2">Payment Status</div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="text-sm text-gray-600 mb-2">Date</div>
            <div className="text-lg font-bold text-gray-900">
              {new Date(payment.createdAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(payment.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            {["overview", "user", "booking", "package"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-indigo-600 text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[5px] border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Transaction ID</div>
                    <div className="font-medium text-gray-900">{payment.transactionId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="font-medium text-gray-900">
                      £{payment.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Payment Method</div>
                    <div className="font-medium text-gray-900">{payment.paymentMethod}</div>
                  </div>
                  {payment.razorpayOrderId && (
                    <div>
                      <div className="text-sm text-gray-600">Order ID</div>
                      <div className="font-medium text-gray-900 truncate">
                        {payment.razorpayOrderId}
                      </div>
                    </div>
                  )}
                  {payment.razorpayPaymentId && (
                    <div>
                      <div className="text-sm text-gray-600">Razorpay Payment ID</div>
                      <div className="font-medium text-gray-900 truncate">
                        {payment.razorpayPaymentId}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[5px] border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Status & Timeline</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Current Status</div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1).toLowerCase()}
                      </Badge>
                      {editingStatus ? (
                        <div className="flex gap-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={handleStatusUpdate}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingStatus(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStatus(true)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="font-medium text-gray-900">
                      {new Date(payment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                    <div className="font-medium text-gray-900">
                      {new Date(payment.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Tab */}
          {activeTab === "user" && (
            <div className="bg-white rounded-[5px] border p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Payer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-medium text-gray-900">
                        {payment.user.firstName} {payment.user.lastName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{payment.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium text-gray-900">{payment.user.phone || "N/A"}</div>
                    </div>
                  </div>
                </div>
                <div>
                  {payment.user.avatar && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={payment.user.avatar}
                        alt={`${payment.user.firstName} ${payment.user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking Tab */}
          {activeTab === "booking" && (
            <div className="bg-white rounded-[5px] border p-6">
              {payment.booking ? (
                <>
                  <h3 className="font-semibold text-gray-900 mb-6">Booking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Property</div>
                          <div className="font-medium text-gray-900">
                            {payment.booking.property.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Check-in</div>
                          <div className="font-medium text-gray-900">
                            {new Date(payment.booking.checkIn).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Check-out</div>
                          <div className="font-medium text-gray-900">
                            {new Date(payment.booking.checkOut).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm text-indigo-900">
                        This payment is linked to a booking reservation. Click the booking ID to view full details.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No booking associated with this payment
                </div>
              )}
            </div>
          )}

          {/* Package Tab */}
          {activeTab === "package" && (
            <div className="bg-white rounded-[5px] border p-6">
              {payment.package ? (
                <>
                  <h3 className="font-semibold text-gray-900 mb-6">Owner Package Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Package Name</div>
                          <div className="font-medium text-gray-900">{payment.package.package.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Package Price</div>
                          <div className="font-medium text-gray-900">
                            £{payment.package.package.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm text-indigo-900">
                        This payment is for an owner package subscription.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No package associated with this payment
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
