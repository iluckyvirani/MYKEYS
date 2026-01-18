"use client";

import { motion } from "framer-motion";
import {
    Home,
    Building,
    Users,
    Shield,
    TrendingUp,
    Globe,
    Phone,
    Mail,
    MapPin,
    Clock,
    Award,
    CheckCircle,
    Star,
    Heart,
    MessageSquare,
    Zap,
    Lock,
    CreditCard,
    Calendar,
    Key,
    DollarSign,
    Building2,
    Hotel,
    Calculator,
    Search,
    MapPin as MapPinIcon,
    CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Import components we'll create

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/about/HeroBanner";
import BusinessModel from "@/components/about/BusinessModel";
import HowItWorks from "@/components/about/HowItWorks";
import StatsSection from "@/components/about/StatsSection";
import TeamSection from "@/components/about/TeamSection";

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen">

                {/* Hero Banner Component */}
                <HeroBanner />

                {/* Business Model Component */}
                <BusinessModel />

                {/* How It Works Component */}
                <HowItWorks />

                {/* Stats Section */}
                <StatsSection />

            </main>
            <Footer />
        </>
    );
}