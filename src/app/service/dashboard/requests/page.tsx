// app/service/dashboard/requests/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Clock, MapPin, User, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

interface ServiceRequest {
  id: string;
  clientName: string;
  serviceType: string;
  location: string;
  requestDate: string;
  description: string;
  budget: number;
  status: "pending" | "accepted" | "rejected";
  urgency: "low" | "medium" | "high";
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/service/requests?limit=50&sortOrder=desc");
        const data = res.data?.data?.items;
        if (data) {
          setRequests(data);
        }
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleRespond = async (id: string, action: "accept" | "reject") => {
    try {
      await api.patch(`/service/requests/${id}/respond`, { action });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: action === "accept" ? "accepted" : "rejected" } : r
        )
      );
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterRequests = (status: string) => {
    return requests.filter((r) => r.status === status);
  };

  const RequestCard = ({ request }: { request: ServiceRequest }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{request.serviceType}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <User className="w-4 h-4" />
            {request.clientName}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{request.description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {request.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {new Date(request.requestDate).toLocaleDateString()}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <p className="font-semibold text-gray-900 flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          Budget: ₹{request.budget}
        </p>
        
        {request.status === "pending" && (
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRespond(request.id, "accept")}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleRespond(request.id, "reject")}>
              <XCircle className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        )}
        
        {request.status === "accepted" && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Accepted
          </span>
        )}
        
        {request.status === "rejected" && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Declined
          </span>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and respond to new service requests from clients.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none p-0">
            <TabsTrigger value="pending" className="rounded-none">
              Pending ({filterRequests("pending").length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="rounded-none">
              Accepted ({filterRequests("accepted").length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-none">
              Declined ({filterRequests("rejected").length})
            </TabsTrigger>
          </TabsList>

          <div className="p-5">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading requests...</p>
              </div>
            ) : (
            <>
            <TabsContent value="pending" className="space-y-4">
              {filterRequests("pending").length > 0 ? (
                filterRequests("pending").map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No pending requests</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              {filterRequests("accepted").length > 0 ? (
                filterRequests("accepted").map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No accepted requests</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {filterRequests("rejected").length > 0 ? (
                filterRequests("rejected").map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No declined requests</p>
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
