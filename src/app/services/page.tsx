"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import ServiceRegistrationForm from "@/components/services/ServiceRegistrationForm";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Users,
  Home,
  Wrench,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Calendar,
  UserCheck,
  Briefcase,
  MapPin,
  Star,
  ArrowRight,
  Shield,
  CreditCard,
  LogIn,
} from "lucide-react";

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleProviderClick = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setShowServiceDialog(true);
    } else {
      router.push("/login?redirect=/services");
    }
  };

  const handleServiceSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        category: data.category,
        subcategories: data.subcategories || [],
        serviceAreas: data.serviceAreas || [],
        bio: data.bio || "",
        instantBookingEnabled: data.instantBooking || false,
        instantBookingPrice: data.instantPrice ? parseFloat(data.instantPrice) : undefined,
      };

      const response = await api.post("/users/become-service", payload);

      if (response.data?.success) {
        // Update tokens with new SERVICE role
        if (response.data.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.data.accessToken);
        }
        if (response.data.data?.refreshToken) {
          localStorage.setItem("refreshToken", response.data.data.refreshToken);
        }

        // Update user data in localStorage with new roles
        if (response.data.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }

        toast({
          title: "Success! 🎉",
          description: "You are now a service professional! You can start offering services.",
          variant: "default",
        });

        setShowServiceDialog(false);
        
        // Redirect to service dashboard after a short delay
        setTimeout(() => {
          router.push("/service/dashboard");
        }, 2000);
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Service registration error:", error);
      
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden">
          {/* Background Image with overlays */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-no-repeat bg-center bg-cover"
              style={{
                backgroundImage: "url('https://images.pexels.com/photos/3912519/pexels-photo-3912519.jpeg?auto=compress&cs=tinysrgb&w=1600')",
              }}
            />

            {/* Gradient overlays for better text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/80" />
            <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent" />

            {/* Animated background blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                  Services Made
                  <span className="block text-green-400 mt-2">Simple</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto font-light">
                  Connect with trusted service professionals - whether you need help at home or want to earn money by providing services
                </p>
              </motion.div>
            </div>

            {/* Quick Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <Link href="/login?role=user&redirect=/user/dashboard/services">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer">
                  <Users className="w-6 h-6" />
                  <span className="text-lg font-semibold">Book Services</span>
                  <span className="text-sm text-green-100">Find service providers</span>
                </Button>
              </Link>

              <Link href="/login?role=owner&redirect=/owner/dashboard/services">
                <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  <Home className="w-6 h-6" />
                  <span className="text-lg font-semibold">Book for Properties</span>
                  <span className="text-sm text-blue-100">Maintenance & repairs</span>
                </Button>
              </Link>

              <Button 
                onClick={handleProviderClick}
                className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-lg font-semibold">Become a Provider</span>
                <span className="text-sm text-purple-100">Earn money</span>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* How It Works - Users */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">How Users Book Services</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Finding and booking trusted professionals is now easier than ever
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse Services</h3>
                <p className="text-gray-600 mb-4">
                  Explore various services like plumbing, cleaning, cooking, electrical work, and more
                </p>
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                  <Wrench className="w-4 h-4" />
                  Select by category
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Review Providers</h3>
                <p className="text-gray-600 mb-4">
                  Check ratings, reviews, prices, and availability of multiple service providers
                </p>
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Star className="w-4 h-4" />
                  Compare options
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Booking Type</h3>
                <p className="text-gray-600 mb-4">
                  Select Instant for same-day service or Schedule for a specific date & time
                </p>
                <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Pick your time
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Confirm & Pay</h3>
                <p className="text-gray-600 mb-4">
                  Review pricing, complete payment through secure payment gateway, and track your booking
                </p>
                <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                  <CreditCard className="w-4 h-4" />
                  Secure payment
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instant vs Schedule */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Booking Types Explained</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Choose the booking type that works best for your needs
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Instant Booking */}
              <div className="bg-white p-8 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Instant Service</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Need help right now? Instant bookings connect you with available professionals who can arrive within a few hours.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Same-day availability</p>
                        <p className="text-sm text-gray-600">Professionals available to come immediately</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Quick arrival</p>
                        <p className="text-sm text-gray-600">Usually arrives within 2-4 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Perfect for emergencies</p>
                        <p className="text-sm text-gray-600">Water leaks, electrical issues, broken door locks</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-900 text-sm">
                      <span className="font-semibold">Pricing:</span> Standard rates with possible rush fee (10-20%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Booking */}
              <div className="bg-white p-8 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Scheduled Service</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Plan ahead for non-urgent services. Choose your preferred date and time, and reserve a professional in advance.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Flexible scheduling</p>
                        <p className="text-sm text-gray-600">Choose your preferred date and time window</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Better rates</p>
                        <p className="text-sm text-gray-600">Lower pricing than instant service</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Plan ahead</p>
                        <p className="text-sm text-gray-600">Deep cleaning, renovations, maintenance work</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900 text-sm">
                      <span className="font-semibold">Pricing:</span> Standard rates - book early for better availability
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Owners */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">For Property Owners</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Keep your properties in perfect condition with maintenance and repair services
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-8 rounded-lg border border-blue-200">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4">
                  <Home className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Select Property</h3>
                <p className="text-gray-600 mb-4">
                  Choose which of your properties needs maintenance or repairs
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Manage multiple properties
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Property-specific history
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-8 rounded-lg border border-purple-200">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center mb-4">
                  <Wrench className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose Service</h3>
                <p className="text-gray-600 mb-4">
                  Browse maintenance-focused services like plumbing, electrical, painting, and pest control
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    Professional providers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    Verified expertise
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-8 rounded-lg border border-green-200">
                <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Track & Review</h3>
                <p className="text-gray-600 mb-4">
                  Monitor work progress and leave reviews for quality service providers
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    Real-time updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    Build trust network
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Providers Earn */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">For Service Providers</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Join our platform and start earning money by providing quality services
            </p>

            {/* Registration Process */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Registration Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Step 1 */}
                <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                    1
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Create Account</h4>
                  <p className="text-gray-600 text-sm">
                    Sign up by providing basic information - name, email, phone number
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                    2
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Services</h4>
                  <p className="text-gray-600 text-sm">
                    Choose your primary service category and subcategories (Plumbing, Electrical, Cleaning, etc.)
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                    3
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Verify & Approve</h4>
                  <p className="text-gray-600 text-sm">
                    We verify your credentials and approve your profile to ensure quality standards
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mb-4 text-lg">
                    4
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Start Earning</h4>
                  <p className="text-gray-600 text-sm">
                    Receive service requests and start accepting bookings to earn money
                  </p>
                </div>
              </div>
            </div>

            {/* How They Earn */}
            <div className="bg-white p-8 rounded-lg border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How You Earn Money</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Instant Bookings */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-7 h-7 text-green-600" />
                    <h4 className="text-xl font-semibold text-gray-900">Instant Bookings</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">How it works:</p>
                      <p className="text-sm text-gray-600">
                        Users can book you for immediate service. You receive notifications and can accept within minutes
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Higher rates:</p>
                      <p className="text-sm text-gray-600">
                        Earn 10-20% more than scheduled bookings due to quick availability
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Stay active:</p>
                      <p className="text-sm text-gray-600">
                        Keep your profile marked as "online" to receive instant service requests
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduled Bookings */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-7 h-7 text-blue-600" />
                    <h4 className="text-xl font-semibold text-gray-900">Scheduled Bookings</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Plan your schedule:</p>
                      <p className="text-sm text-gray-600">
                        Browse upcoming bookings and accept those that fit your availability
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Set your prices:</p>
                      <p className="text-sm text-gray-600">
                        Define your base price and hourly rates based on service type and experience
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Build reputation:</p>
                      <p className="text-sm text-gray-600">
                        Customer ratings and reviews help you get more bookings and earn more
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-1">Flexible Income</h5>
                  <p className="text-sm text-gray-600">
                    Work as much or as little as you want - you control your availability
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-1">Secure Payments</h5>
                  <p className="text-sm text-gray-600">
                    Get paid securely through our platform within 3-5 business days
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-1">Build Business</h5>
                  <p className="text-sm text-gray-600">
                    Grow your customer base and expand your service offerings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-linear-to-r from-green-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Whether you're looking to book services or become a service provider, we're here to help
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 font-semibold cursor-pointer" asChild>
                <Link href="/login?role=user">
                  <LogIn className="w-5 h-5 mr-2" />
                  Book Services
                </Link>
              </Button>
              <Button 
                onClick={handleProviderClick}
                className="text-green-600 hover:bg-gray-100 hover:text-green-600 px-8 py-3 font-semibold cursor-pointer" 
                variant="outline"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Become a Provider
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Service Registration Dialog */}
      <ServiceRegistrationForm
        open={showServiceDialog}
        onOpenChange={setShowServiceDialog}
        onSubmit={handleServiceSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
