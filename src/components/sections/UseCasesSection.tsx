"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Building2, Wrench, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ServiceRegistrationForm from "@/components/services/ServiceRegistrationForm";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const useCases = [
  {
    id: "user",
    role: "As a User/Buyer",
    description: "Discover and purchase your ideal property or book services with ease",
    icon: Users,
    benefits: [
      "Browse verified listings",
      "Compare prices and features",
      "Book properties instantly",
      "Secure payment options",
      "24/7 customer support",
    ],
    cta: "Start Exploring",
    link: "/buy",
    color: "from-green-500 to-emerald-500",
    lightBg: "bg-green-50",
    textColor: "text-green-600",
  },
  {
    id: "owner",
    role: "As a Property Owner",
    description: "List and manage your properties, reach more clients, earn passive income",
    icon: Building2,
    benefits: [
      "Easy property listing",
      "Tenant management tools",
      "Payment tracking",
      "Automatic rent collection",
      "Legal document support",
    ],
    cta: "List Your Property",
    link: "/signup",
    color: "from-green-600 to-emerald-600",
    lightBg: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    id: "provider",
    role: "As a Service Provider",
    description: "Grow your service business, connect with more clients, increase earnings",
    icon: Wrench,
    benefits: [
      "Register your services",
      "Get verified and trusted",
      "Manage bookings easily",
      "Flexible scheduling",
      "Earn competitive rates",
    ],
    cta: "Join as Provider",
    link: "/signup",
    color: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
];

export default function UseCasesSection() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState<string>("user");
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleProviderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (token) {
      setShowServiceDialog(true);
    } else {
      router.push("/login?redirect=/");
    }
  };

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push("/owner/dashboard");
    } else {
      router.push("/signup");
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium">Featured Properties</span>
          </div>
          <h2 className="font-spartan text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Discover Your Role
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're looking to find properties, list them, or offer services, MYKEYS has a solution for you
          </p>
        </motion.div>

        {/* Use Cases Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            const isActive = activeCard === useCase.id;

            return (
              <motion.div
                key={useCase.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setActiveCard(useCase.id)}
              >
                <div
                  className={`h-full rounded-2xl p-8 transition-all duration-300 cursor-pointer border-2 ${isActive
                    ? `border-transparent bg-linear-to-br from-green-500 to-emerald-500 text-white shadow-2xl transform scale-105`
                    : `bg-green-50 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl`
                    }`}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                    className={`inline-block p-4 rounded-xl mb-6 ${isActive ? "bg-white/20" : `bg-linear-to-br from-green-500 to-emerald-500 text-white`
                      }`}
                  >
                    <IconComponent className={`w-8 h-8 ${isActive ? "text-white" : "text-green-900"}`} />
                  </motion.div>

                  {/* Content */}
                  <h3 className={`text-2xl font-bold mb-2 ${isActive ? "text-white" : "text-gray-900"}`}>
                    {useCase.role}
                  </h3>
                  <p className={`mb-6 ${isActive ? "text-white/90" : "text-gray-600"}`}>
                    {useCase.description}
                  </p>

                  {/* Benefits */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: isActive ? 1 : 0, height: isActive ? "auto" : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className={`space-y-3 mb-8 ${isActive ? "block" : "hidden"}`}>
                      {useCase.benefits.map((benefit, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 shrink-0" />
                          <span className="text-white/90">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* CTA Button */}
                  {useCase.id === "provider" ? (
                    <button
                      onClick={handleProviderClick}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${isActive
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : `bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg`
                        }`}
                    >
                      {useCase.cta}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : useCase.id === "owner" ? (
                    <button
                      onClick={handleOwnerClick}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${isActive
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : `bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg`
                        }`}
                    >
                      {useCase.cta}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <Link
                      href={useCase.link}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${isActive
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : `bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg`
                        }`}
                    >
                      {useCase.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

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
