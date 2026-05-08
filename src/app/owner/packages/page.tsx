"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OwnerPackageManager from "@/components/owner/OwnerPackageManager";
import { Package } from "lucide-react";

export default function OwnerPackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-green-600" /> My Package
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your subscription for Long Rent &amp; Buy listings
          </p>
        </div>
        <OwnerPackageManager />
      </main>
      <Footer />
    </div>
  );
}
