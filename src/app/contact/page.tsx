"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Phone,
    MapPin,
    Clock,
    MessageSquare,
    Building2,
    Users,
    Shield,
    Headphones,
    Globe,
    TrendingUp,
    Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/contact/ContactForm";
import ContactCards from "@/components/contact/ContactCards";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FAQSection from "@/components/contact/FAQSection";


const departments = [
    {
        name: "Short Rent Support",
        icon: <Hotel className="w-5 h-5" />,
        email: "shortstay@propertyplatform.com",
        phone: "+44 20 1234 5670",
        description: "Instant bookings, payments, stay issues"
    },
    {
        name: "Long Term Rentals",
        icon: <Clock className="w-5 h-5" />,
        email: "longterm@propertyplatform.com",
        phone: "+44 20 1234 5671",
        description: "Rental inquiries, agreements, management"
    },
    {
        name: "Property Sales",
        icon: <TrendingUp className="w-5 h-5" />,
        email: "sales@propertyplatform.com",
        phone: "+44 20 1234 5672",
        description: "Purchase inquiries, viewing, negotiations"
    },
    {
        name: "Owner Support",
        icon: <Building2 className="w-5 h-5" />,
        email: "owners@propertyplatform.com",
        phone: "+44 20 1234 5673",
        description: "Listing, management, payments"
    },
    {
        name: "Verification & Safety",
        icon: <Shield className="w-5 h-5" />,
        email: "safety@propertyplatform.com",
        phone: "+44 20 1234 5674",
        description: "Account verification, disputes, security"
    },
    {
        name: "Business Partnerships",
        icon: <Users className="w-5 h-5" />,
        email: "partners@propertyplatform.com",
        phone: "+44 20 1234 5675",
        description: "Corporate accounts, partnerships"
    },
];


export default function ContactPage() {
    const [activeTab, setActiveTab] = useState("general");

    return (
        <>
            <Navbar />
            <main className="min-h-screen mb-10">
                {/* Hero Section */}
                <section className="relative py-20 md:py-28 overflow-hidden bg-linear-to-br from-gray-900 via-green-900 to-violet-800">
                    {/* Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                        <div className="absolute bottom-10 right-10 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <h1 className="font-spartan text-4xl sm:text-5xl md:text-5xl font-bold text-white mb-1 leading-tight tracking-tight">
                                Get In Touch
                                <span className="block text-green-400 mt-1">
                                    We're Here to Help
                                </span>
                            </h1>

                            <p className="font-spartan text-lg sm:text-md text-gray-200 max-w-lg mx-auto mb-10 font-light">
                                Whether you're looking for a property, listing yours, or need support,
                                our team is ready to assist you with our three-tier platform.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 rounded-[5px] text-lg"
                                >
                                    <Headphones className="w-5 h-5 mr-2" />
                                    Live Chat Support
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-white/10 border-white text-white hover:bg-white/10 px-8 py-6 rounded-[5px] text-lg"
                                >
                                    <Phone className="w-5 h-5 mr-2" />
                                    Call Now: +44 20 1234 5678
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Contact Cards */}
                        <div className="lg:col-span-1">
                            <ContactCards />
                        </div>

                        {/* Right Column - Contact Form & Tabs */}
                        <div className="lg:col-span-2">
                            {/* Tabs Navigation */}
                            <div className="bg-white rounded-[5px] shadow-lg mb-8 overflow-hidden border border-gray-100">
                                <div className="border-b border-gray-200">
                                    <nav className="flex flex-wrap -mb-px">
                                        {[
                                            { id: "general", label: "General Inquiry", icon: <MessageSquare className="w-4 h-4" /> },
                                            { id: "short", label: "Short Rent", icon: <Building2 className="w-4 h-4" /> },
                                            { id: "long", label: "Long Term", icon: <Clock className="w-4 h-4" /> },
                                            { id: "buy", label: "Property Purchase", icon: <Shield className="w-4 h-4" /> },
                                            { id: "owner", label: "For Owners", icon: <Users className="w-4 h-4" /> },
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                                    ? "border-green-500 text-green-600 bg-green-50"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                    }`}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === "general" && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">General Inquiry</h3>
                                            <p className="text-gray-600 mb-6">
                                                Have questions about our platform or need general assistance?
                                                We're here to help with anything related to our services.
                                            </p>
                                        </div>
                                    )}
                                    {activeTab === "short" && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Short rent Support</h3>
                                            <p className="text-gray-600 mb-6">
                                                Need help with instant bookings, payment issues, or short-term stay questions?
                                                Our dedicated short rent team can assist you.
                                            </p>
                                        </div>
                                    )}
                                    {activeTab === "long" && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Long Term Rental Support</h3>
                                            <p className="text-gray-600 mb-6">
                                                Questions about long-term rentals, inquiries, or rental agreements?
                                                We'll connect you with the right specialist.
                                            </p>
                                        </div>
                                    )}
                                    {activeTab === "buy" && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Property Purchase Support</h3>
                                            <p className="text-gray-600 mb-6">
                                                Looking to buy a property or need assistance with purchase inquiries?
                                                Our property specialists are here to help.
                                            </p>
                                        </div>
                                    )}
                                    {activeTab === "owner" && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">For Property Owners</h3>
                                            <p className="text-gray-600 mb-6">
                                                Need help listing your property, managing bookings, or understanding owner packages?
                                                We're here to support you.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Form Component */}
                            <ContactForm inquiryType={activeTab} />
                        </div>
                    </div>

                    {/* Departments Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-linear-to-br from-gray-900 to-black rounded-[5px] p-6 mt-10"
                    >
                        <h3 className="text-xl font-bold text-white mb-6">Specialized Departments</h3>
                        <div className="grid grid-cols-3 gap-6">
                            {departments.map((dept, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-[5px] p-4 hover:bg-white/20 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <div className="text-white">
                                                {dept.icon}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white mb-1">{dept.name}</h4>
                                            <p className="text-gray-300 text-sm mb-2">{dept.description}</p>
                                            <div className="flex flex-col sm:flex-col sm:items-start gap-2 text-sm">
                                                <a href={`mailto:${dept.email}`} className="text-blue-300 hover:text-blue-200">
                                                    {dept.email}
                                                </a>
                                                <a href={`tel:${dept.phone.replace(/\s/g, '')}`} className="text-green-300 hover:text-green-200">
                                                    {dept.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    {/* FAQ Section */}
                    <div className="mt-10">
                        <FAQSection />
                    </div>



                    {/* Map & Location Section */}
                    <div className="mt-10 bg-white rounded-[5px] shadow-lg overflow-hidden border border-gray-100">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="w-6 h-6 text-green-600" />
                                <h3 className="text-2xl font-bold text-gray-900">Our Locations</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Map Placeholder */}
                                <div className="bg-gray-100 rounded-[5px] h-96 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MapPin className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="text-gray-600 font-medium">Interactive Map</p>
                                        <p className="text-gray-500 text-sm mt-1">Google Maps integration</p>
                                    </div>
                                </div>

                                {/* Office Locations */}
                                <div className="space-y-6">
                                    <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-[5px] p-6 border border-green-200">
                                        <h4 className="font-bold text-gray-900 mb-3">Headquarters - London</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">123 Property Street</p>
                                                    <p className="text-gray-600 text-sm">London, EC1A 1BB, United Kingdom</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Business Hours</p>
                                                    <p className="text-gray-600 text-sm">Mon-Fri: 9:00 AM - 6:00 PM GMT</p>
                                                    <p className="text-gray-600 text-sm">Sat: 10:00 AM - 4:00 PM GMT</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-[5px] p-6 border border-blue-200">
                                        <h4 className="font-bold text-gray-900 mb-3">Regional Office - Manchester</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">456 Business Avenue</p>
                                                    <p className="text-gray-600 text-sm">Manchester, M1 1AA, United Kingdom</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Business Hours</p>
                                                    <p className="text-gray-600 text-sm">Mon-Fri: 9:00 AM - 5:30 PM GMT</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}