"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Calendar, Clock, MapPin, FileText, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { SERVICE_CATEGORIES, INSTANT_BOOKING_PRICES, ServiceCategory, ServiceProvider } from "@/types/service";

interface ServiceBookingModalProps {
  isOpen: boolean;
  provider: ServiceProvider | null;
  onClose: () => void;
  onBookComplete?: (bookingData: any) => void;
}

export default function ServiceBookingModal({
  isOpen,
  provider,
  onClose,
  onBookComplete,
}: ServiceBookingModalProps) {
  const [step, setStep] = useState<"type" | "details" | "payment" | "confirmation">("type");
  const [bookingType, setBookingType] = useState<"instant" | "scheduled">("instant");
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    serviceArea: "",
    description: "",
    name: "",
    phone: "",
    address: "",
  });

  if (!provider) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBooking = () => {
    if (bookingType === "instant") {
      setStep("payment");
    } else {
      if (formData.date && formData.time && formData.serviceArea) {
        setStep("payment");
      }
    }
  };

  const handlePayment = () => {
    setStep("confirmation");
    // In real app, integrate payment gateway here
    const bookingData = {
      ...formData,
      bookingType,
      provider: provider.name,
      providerId: provider.id,
      amount: bookingType === "instant" ? provider.instantBookingPrice : 500,
    };
    onBookComplete?.(bookingData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
              <h2 className="text-2xl font-bold">Book Service</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Provider Info */}
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-4">
                <img
                  src={provider.profileImage}
                  alt={provider.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-green-600"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
                  <p className="text-gray-600">{provider.phone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-lg">{provider.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {provider.totalReviews} reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === "type" && (
                  <motion.div
                    key="type"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold mb-4">Select Booking Type</h3>

                      {/* Instant Booking Option */}
                      {provider.instantBookingEnabled ? (
                        <motion.div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all mb-4 ${
                            bookingType === "instant"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-blue-400"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setBookingType("instant")}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                                bookingType === "instant"
                                  ? "border-green-600 bg-green-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {bookingType === "instant" && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <h4 className="font-bold text-gray-900">Instant Booking</h4>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Service professional arrives immediately
                              </p>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                ₹{provider.instantBookingPrice}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 mb-4 opacity-60"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-600">Instant Booking</h4>
                              <p className="text-sm text-gray-500">
                                Not available for this professional right now
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Scheduled Booking Option */}
                      <motion.div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          bookingType === "scheduled"
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-400"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setBookingType("scheduled")}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                              bookingType === "scheduled"
                                ? "border-green-600 bg-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {bookingType === "scheduled" && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <h4 className="font-bold text-gray-900">Schedule Service</h4>
                            </div>
                            <p className="text-sm text-gray-600">
                              Choose your preferred date and time
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-bold">Service Details</h3>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Your phone number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Service Address</Label>
                        <Input
                          id="address"
                          placeholder="Where should we come?"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {/* Service Area Selection */}
                    <div>
                      <Label htmlFor="area">Service Area</Label>
                      <select
                        id="area"
                        className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={formData.serviceArea}
                        onChange={(e) => handleInputChange("serviceArea", e.target.value)}
                      >
                        <option value="">Select service area</option>
                        {provider.serviceAreas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Scheduled Booking Time */}
                    {bookingType === "scheduled" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="date">Preferred Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="time">Preferred Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={formData.time}
                            onChange={(e) => handleInputChange("time", e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Service Description (Optional)</Label>
                      <textarea
                        id="description"
                        placeholder="Describe what you need..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none h-24"
                      />
                    </div>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-bold">Payment Details</h3>

                    <Card className="bg-green-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Service Professional</span>
                          <span className="font-semibold">{provider.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Booking Type</span>
                          <span className="font-semibold capitalize">{bookingType}</span>
                        </div>
                        {bookingType === "scheduled" && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Date</span>
                              <span className="font-semibold">{formData.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Time</span>
                              <span className="font-semibold">{formData.time}</span>
                            </div>
                          </>
                        )}
                        <div className="border-t border-green-200 pt-3 flex justify-between text-lg">
                          <span className="font-bold">Total Amount</span>
                          <span className="font-bold text-green-600">
                            ₹
                            {bookingType === "instant"
                              ? provider.instantBookingPrice
                              : 500}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-900">Secure Payment</p>
                        <p className="text-sm text-green-800">
                          All payments are protected and encrypted
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === "confirmation" && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6 text-center py-8"
                  >
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Booking Confirmed!
                      </h3>
                      <p className="text-gray-600">
                        {bookingType === "instant"
                          ? "Your instant service is being arranged. You'll receive a call shortly."
                          : `Your service is scheduled for ${formData.date} at ${formData.time}`}
                      </p>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Booking ID</span>
                          <span className="font-mono font-bold text-sm">
                            BK{Date.now().toString().slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Professional</span>
                          <span className="font-semibold">{provider.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-white">
              {step !== "confirmation" && (
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              )}
              {step === "type" && (
                <Button
                  onClick={() => setStep("details")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!provider.instantBookingEnabled && bookingType === "instant"}
                >
                  Continue
                </Button>
              )}

              {step === "details" && (
                <Button
                  onClick={handleBooking}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={
                    !formData.name ||
                    !formData.phone ||
                    !formData.address ||
                    !formData.serviceArea ||
                    (bookingType === "scheduled" && (!formData.date || !formData.time))
                  }
                >
                  Review & Pay
                </Button>
              )}

              {step === "payment" && (
                <Button
                  onClick={handlePayment}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Pay Now
                </Button>
              )}

              {step === "confirmation" && (
                <Button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700">
                  Done
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
