"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServiceRegistrationForm from "@/components/services/ServiceRegistrationForm";
import { api } from "@/lib/api";

export default function ServiceRegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);

  const handleRegistrationSubmit = async (data: any) => {
    console.log("Registration data:", data);
    
    if (isSubmitting) return;

    // Check if user is logged in
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Please log in first to register as a service provider.");
      router.push("/login?redirect=/services/register");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map form data to API format
      const payload = {
        bio: data.bio || "",
        category: data.categoryId,  // ServiceCategoryInfo.id
        subcategories: [],
        serviceAreas: data.serviceAreas || [],
        specializations: [],
        certifications: [],
        instantBookingEnabled: data.instantBooking || false,
        instantBookingPrice: data.instantBooking ? parseFloat(data.instantPrice) || undefined : undefined,
      };

      console.log("Sending to API:", payload);

      // Call the become-service API endpoint
      const response = await api.post("/users/become-service", payload);

      console.log("API Response:", response.data);

      if (response.data?.success) {
        // Update tokens with new SERVICE role tokens
        const { accessToken, refreshToken } = response.data.data;
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // Show success message
        alert("Registration successful! You are now a service professional. Redirecting to your service dashboard...");
        
        // Redirect to service dashboard
        router.push("/service/dashboard");
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (errorMessage.includes("already has SERVICE role")) {
        errorMessage = "You are already registered as a service provider. Redirecting to dashboard...";
        setTimeout(() => {
          router.push("/service/dashboard");
        }, 2000);
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ServiceRegistrationForm 
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleRegistrationSubmit} 
        />
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
              <p className="text-center text-gray-700 font-medium">
                Processing your registration...
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
