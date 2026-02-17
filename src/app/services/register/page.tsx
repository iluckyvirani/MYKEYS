"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServiceRegistrationForm from "@/components/services/ServiceRegistrationForm";

export default function ServiceRegisterPage() {
  const handleRegistrationSubmit = (data: any) => {
    console.log("Registration data:", data);
    // Here you would send the data to your API
    // Example: await apiCall.registerServiceProvider(data);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ServiceRegistrationForm onSubmit={handleRegistrationSubmit} />
      </main>
      <Footer />
    </>
  );
}
