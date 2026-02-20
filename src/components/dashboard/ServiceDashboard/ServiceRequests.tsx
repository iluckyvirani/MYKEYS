"use client";

import { Clock, MapPin, User, Phone, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ServiceRequest {
  id: string;
  clientName: string;
  serviceType: string;
  location: string;
  requestDate: string;
  description: string;
  budget: number;
  urgency: "low" | "medium" | "high";
}

export default function ServiceRequests() {
  const requests: ServiceRequest[] = [
    {
      id: "1",
      clientName: "Vikram Sharma",
      serviceType: "Home Painting",
      location: "North Area",
      requestDate: "2026-02-19",
      description: "2-bedroom apartment interior painting",
      budget: 5000,
      urgency: "medium",
    },
    {
      id: "2",
      clientName: "Neha Desai",
      serviceType: "Plumbing Work",
      location: "City Center",
      requestDate: "2026-02-19",
      description: "Bathroom renovation and fixtures",
      budget: 8000,
      urgency: "high",
    },
    {
      id: "3",
      clientName: "Suresh Kumar",
      serviceType: "Electrical Installation",
      location: "Suburban",
      requestDate: "2026-02-18",
      description: "New circuit setup for office",
      budget: 3500,
      urgency: "low",
    },
  ];

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">New Requests</h2>
        <Link
          href="/service/dashboard/requests"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div >
                <h3 className="font-semibold text-gray-900">
                  {request.serviceType}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <User className="w-4 h-4" />
                  {request.clientName}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                  request.urgency
                )}`}
              >
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

            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">Budget: ₹{request.budget}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-gray-600"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
