"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { span } from "framer-motion/client";
import { Wrench, Sparkles, Users, Clock, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ServiceRegistrationForm from "@/components/services/ServiceRegistrationForm";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const serviceHighlights = [
  {
    icon: Sparkles,
    title: "Instant Service Booking",
    description: "Get repairs and maintenance done instantly with our verified service providers",
  },
  {
    icon: Users,
    title: "Trusted Professionals",
    description: "All service providers are verified and rated by real users",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book services at your convenience with flexible time slots",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Safe payments and guaranteed work quality with protection guarantee",
  },
  {
    icon: TrendingUp,
    title: "For Providers",
    description: "Grow your business by reaching more customers on our platform",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join thousands of users and providers in our growing community",
  },
];

export default function ServicesPromotionSection() {
  const router = useRouter();
  const { toast } = useToast();
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProviderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (token) {
      setShowServiceDialog(true);
    } else {
      router.push("/login?redirect=/");
    }
  };

  const handleServiceSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const payload = {
        category: data.categoryId,  // ServiceCategoryInfo.id (UUID)
        subcategories: data.subcategories || [],
        serviceAreas: data.serviceAreas || [],
        bio: data.bio || "",
        instantBookingEnabled: data.instantBooking || false,
        instantBookingPrice: data.instantPrice ? parseFloat(data.instantPrice) : undefined,
      };

      const response = await api.post("/users/become-service", payload);

      if (response.data?.success) {
        // Update tokens if provided
        if (response.data.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.data.accessToken);
        }
        if (response.data.data?.refreshToken) {
          localStorage.setItem("refreshToken", response.data.data.refreshToken);
        }

        toast({
          title: "Success! 🎉",
          description: "Your registration has been submitted! We'll review your application and get back to you soon.",
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
    <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/40 to-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-100/40 to-emerald-100/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200">
                <Wrench className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-semibold text-sm">New Feature</span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Your Home Services,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
                {" "}Simplified
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8">
              From quick repairs to regular maintenance, book trusted service providers instantly. No more searching,
              no more waiting. Just quality service at your doorstep.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <p className="text-gray-600 text-sm">Service Providers</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-emerald-600">50+</div>
                <p className="text-gray-600 text-sm">Service Types</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="text-3xl font-bold text-green-600">4.8★</div>
                <p className="text-gray-600 text-sm">Avg. Rating</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/services"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all duration-300"
              >
                Explore Services
              </Link>
              <button
                onClick={handleProviderClick}
                className="px-8 py-4 rounded-lg border-2 border-green-500 text-green-600 font-semibold hover:bg-green-50 transition-all duration-300 cursor-pointer"
              >
                Become a Provider
              </button>
            </div>
          </motion.div>

          {/* Right Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200/50 shadow-xl">
              {/* Placeholder for illustration - could be replaced with actual image */}
              <div className="aspect-video rounded-xl bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center">
                <Wrench className="w-24 h-24 text-emerald-600 opacity-30" />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-4 right-4 bg-white rounded-full p-4 shadow-lg border-2 border-green-200"
              >
                <Clock className="w-6 h-6 text-green-600" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-4 left-4 bg-white rounded-full p-4 shadow-lg border-2 border-emerald-200"
              >
                <Shield className="w-6 h-6 text-emerald-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceHighlights.map((highlight, index) => {
            const IconComponent = highlight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-block p-3 rounded-lg bg-green-100 group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:to-emerald-500 mb-4 transition-all duration-300">
                  <IconComponent className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{highlight.title}</h3>
                <p className="text-gray-600">{highlight.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-8 border border-green-200/50">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Whether you need repairs, maintenance, or want to offer services to earn extra income, MYKEYS Services has you
              covered.
            </p>
            <Link
              href="/services"
              className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all duration-300"
            >
              Start Exploring Services
            </Link>
          </div>
        </motion.div>

        {/* Service Registration Dialog */}
        <ServiceRegistrationForm
          open={showServiceDialog}
          onOpenChange={setShowServiceDialog}
          onSubmit={handleServiceSubmit}
        />
      </div>
    </section>
  );
}
