"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  Mail, Phone, MapPin, ChevronRight, Send,
  ShieldCheck, Award, Clock, Users,
  Home, Building, Castle, Building2,
  Download, FileText, Calendar,
  MessageSquare, Star, Heart,
  Key
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [particles, setParticles] = useState<Array<{ left: string; top: string; duration: number; delay: number }>>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
      }))
    );

    // Handle scroll to show/hide back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const quickLinks = [
    { label: "Buy Properties", href: "/buy" },
    { label: "Short Rent Properties", href: "/rent/short-rent" },
    { label: "Long Rent Properties", href: "/rent/long-rent" },
    { label: "Services", href: "/services" },
    { label: "List property", href: "/how-listing-works" },
  ];

  const propertyTypes = [
    { icon: <Home className="w-4 h-4" />, label: "Apartments", count: "254" },
    { icon: <Building className="w-4 h-4" />, label: "Villas", count: "189" },
    { icon: <Castle className="w-4 h-4" />, label: "Townhouses", count: "76" },
    { icon: <Building2 className="w-4 h-4" />, label: "Offices", count: "142" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    // { label: "Careers", href: "/careers" },
    // { label: "Press & Media", href: "/press" },
    // { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
    // { label: "Help Center", href: "/help" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  const resources = [
    { icon: <Download className="w-4 h-4" />, label: "Buyer's Guide", href: "/guide/buyer" },
    { icon: <FileText className="w-4 h-4" />, label: "Seller's Guide", href: "/guide/seller" },
    { icon: <Calendar className="w-4 h-4" />, label: "Market Reports", href: "/reports" },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Community Forum", href: "/forum" },
  ];

  const trustBadges = [
    { icon: <ShieldCheck className="w-5 h-5" />, label: "Secure Transactions" },
    { icon: <Award className="w-5 h-5" />, label: "Award Winning" },
    { icon: <Clock className="w-5 h-5" />, label: "24/7 Support" },
    { icon: <Users className="w-5 h-5" />, label: "Verified Agents" },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
    { icon: <Youtube className="w-5 h-5" />, href: "#", label: "YouTube" },
  ];

  const downloadApps = [
    { label: "App Store", bg: "bg-black", text: "white" },
    { label: "Google Play", bg: "bg-white", text: "gray-900" },
    { label: "Huawei AppGallery", bg: "bg-red-500", text: "white" },
  ];

  return (
    <footer className="relative bg-linear-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Top Section - Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
            {/* Left Column - Brand & Newsletter */}
            <div className="space-y-8">
              {/* Brand */}
              <div className="space-y-4">
                <Link href="/" className="inline-flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="font-spartan text-3xl font-bold">MYKEYS</span>
                    <div className="text-sm text-gray-400">Premium Real Estate</div>
                  </div>
                </Link>
                <p className="text-gray-400 max-w-md">
                  Your trusted partner in finding dream properties. With cutting-edge technology
                  and personalized service, we transform your real estate journey into a seamless experience.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                {trustBadges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-[5px] backdrop-blur-sm hover:bg-white/10 transition-colors"
                  >
                    <div className="text-green-400">{badge.icon}</div>
                    <span className="text-sm font-medium">{badge.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Newsletter */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
                <p className="text-gray-400">
                  Get the latest property listings, market insights, and exclusive offers.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium py-3.5 rounded-[5px] cursor-pointer hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {subscribed ? "Subscribed! 🎉" : "Subscribe Now"}
                  {!subscribed && <Send className="w-4 h-4" />}
                </motion.button>
              </form>

              {subscribed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-sm"
                >
                  Thank you for subscribing! Check your email for confirmation.
                </motion.div>
              )}

              {/* Social Links */}
              <div className="pt-4">
                <h4 className="text-lg font-medium mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ y: -3 }}
                      className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 hover:text-green-400 transition-all"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Grid - Links & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 border-b border-white/10">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-400 hover:text-white hover:translate-x-2 transition-all group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Property Types */}
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 border-b border-white/10">Property Types</h4>
              <ul className="space-y-3">
                {propertyTypes.map((type, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <Link
                      href={`/properties/${type.label.toLowerCase()}`}
                      className="flex items-center justify-between text-gray-400 hover:text-white transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-green-400">{type.icon}</div>
                        {type.label}
                      </div>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                        {type.count}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 border-b border-white/10">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white hover:translate-x-2 transition-all block"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 border-b border-white/10">Contact Us</h4>
              <ul className="space-y-4">
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 text-gray-400"
                >
                  <Phone className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <div className="font-medium text-white">Phone</div>
                    <a href="tel:+11234567890" className="hover:text-white transition-colors">
                      +1 (123) 456-7890
                    </a>
                  </div>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3 text-gray-400"
                >
                  <Mail className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <div className="font-medium text-white">Email</div>
                    <a href="mailto:info@hously.com" className="hover:text-white transition-colors">
                      info@mykeys.com
                    </a>
                  </div>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 text-gray-400"
                >
                  <MapPin className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <div className="font-medium text-white">Office</div>
                    <div>123 Business Street, Suite 100</div>
                    <div>San Francisco, CA 94107</div>
                  </div>
                </motion.li>
              </ul>
            </div>
          </div>


          {/* Divider */}
          <div className="h-px bg-linear-to-r from-transparent via-white/20 to-transparent mb-10" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} MYKEY. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
                <span className="text-sm ml-1">4.9/5</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm">Trusted by 10,000+ clients</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat Widget */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button className="group relative">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              3
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="text-sm font-medium">Live Chat Support</div>
              <div className="text-xs text-gray-400 mt-1">Available 24/7</div>
            </div>
          </button>
        </motion.div> */}

        {/* Back to Top Button */}
        {showBackToTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ y: -5, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl z-50 transition-all"
            title="Back to top"
          >
            <ChevronRight className="w-5 h-5 text-white -rotate-90" />
          </motion.button>
        )}

      </div>

      {/* Glow Effects */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-green-500/10 to-transparent pointer-events-none" />
    </footer>
  );
}