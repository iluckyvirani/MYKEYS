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
import { api } from "@/lib/api";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/siteDefaults";

const FOOTER_PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartments", icon: Home, href: "/buy?propertyType=APARTMENT" },
  { value: "VILLA", label: "Villas", icon: Building, href: "/buy?propertyType=VILLA" },
  { value: "TOWNHOUSE", label: "Townhouses", icon: Castle, href: "/buy?propertyType=TOWNHOUSE" },
  { value: "HOUSE", label: "Houses", icon: Building2, href: "/buy?propertyType=HOUSE" },
] as const;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [propertyTypeCounts, setPropertyTypeCounts] = useState<Record<string, number>>({});
  const [contactInfo, setContactInfo] = useState({
    phone: DEFAULT_CONTACT_CONTENT.hero.supportPhone,
    email: DEFAULT_CONTACT_CONTENT.hero.supportEmail,
    address: DEFAULT_CONTACT_CONTENT.hero.officeAddress,
  });

  useEffect(() => {
    // Handle scroll to show/hide back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadPropertyTypeCounts = async () => {
      try {
        const response = await api.get("/properties/type-counts");
        if (response.data?.success && response.data.data?.counts) {
          setPropertyTypeCounts(response.data.data.counts);
        }
      } catch {
        // Footer counts are optional; keep empty when the API is unavailable
      }
    };

    loadPropertyTypeCounts();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/content/contact");
        const hero = res.data?.data?.hero;
        if (!cancelled && hero) {
          setContactInfo({
            phone: hero.supportPhone || DEFAULT_CONTACT_CONTENT.hero.supportPhone,
            email: hero.supportEmail || DEFAULT_CONTACT_CONTENT.hero.supportEmail,
            address:
              hero.officeAddress || DEFAULT_CONTACT_CONTENT.hero.officeAddress,
          });
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || subscribing) return;

    setSubscribing(true);
    setSubscribeError("");
    try {
      const response = await api.post("/newsletter/subscribe", { email: trimmed });
      if (response.data?.success) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        setSubscribeError(
          response.data?.message || "Could not subscribe. Please try again."
        );
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not subscribe. Please try again.";
      setSubscribeError(message);
    } finally {
      setSubscribing(false);
    }
  };

  const phoneHref = `tel:${contactInfo.phone.replace(/\s/g, "")}`;
  const emailHref = `mailto:${contactInfo.email}`;
  const addressLines = contactInfo.address
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  const quickLinks = [
    { label: "Buy", href: "/buy" },
    { label: "Rent", href: "/rent/whole-property" },
    { label: "Short Stay", href: "/rent/short-rent" },
    { label: "Services", href: "/services" },
    { label: "List property", href: "/how-listing-works" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
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

  return (
    <footer className="relative bg-white border-t border-gray-100 text-gray-900 overflow-hidden">
      <div className="relative z-10">
        {/* Top Section - Main Footer */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-16 lg:py-20">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
            {/* Left Column - Brand & Newsletter */}
            <div className="space-y-8">
              {/* Brand */}
              <div className="space-y-4">
                <Link href="/" className="inline-flex items-center gap-3 group">
                  <img
                    src="/mykeys-logo-nav.png"
                    alt="MYKEYS"
                    className="h-16 w-auto object-contain group-hover:scale-105 transition-transform"
                  />
                </Link>
                <p className="text-gray-600 max-w-md">
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
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-[5px] border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-green-600">{badge.icon}</div>
                    <span className="text-sm font-medium text-gray-800">{badge.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Newsletter */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Stay Updated</h3>
                <p className="text-gray-600">
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
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 text-gray-900"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={subscribing}
                  className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium py-3.5 rounded-[5px] cursor-pointer hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {subscribed
                    ? "Subscribed!"
                    : subscribing
                      ? "Subscribing…"
                      : "Subscribe Now"}
                  {!subscribed && !subscribing && <Send className="w-4 h-4" />}
                </motion.button>
              </form>

              {subscribeError && (
                <p className="text-red-600 text-sm font-medium">{subscribeError}</p>
              )}

              {subscribed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm font-medium"
                >
                  Thank you for subscribing! We&apos;ll email you when new properties go live.
                </motion.div>
              )}

              {/* Social Links */}
              <div className="pt-4">
                <h4 className="text-lg font-medium mb-3 text-gray-900">Follow Us</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ y: -3 }}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-700 hover:text-green-600 transition-all border border-gray-100"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 border-b border-gray-100 text-gray-900">Quick Links</h4>
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
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:translate-x-2 transition-all group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-green-600" />
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 border-b border-gray-100 text-gray-900">Company</h4>
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
                      className="text-gray-600 hover:text-gray-900 hover:translate-x-2 transition-all block"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 pb-2 border-b border-gray-100 text-gray-900">Get in Touch</h4>
              <ul className="space-y-4">
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3"
                >
                  <Phone className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Phone</div>
                    <a href={phoneHref} className="text-gray-600 hover:text-gray-900 transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Mail className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <a href={emailHref} className="text-gray-600 hover:text-gray-900 transition-colors">
                      {contactInfo.email}
                    </a>
                  </div>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 text-gray-600"
                >
                  <MapPin className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Office</div>
                    {addressLines.length > 1 ? (
                      addressLines.map((line, i) => <div key={i}>{line}</div>)
                    ) : (
                      <div>{contactInfo.address}</div>
                    )}
                  </div>
                </motion.li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-10" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MYKEYS. All rights reserved.
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
                <span className="text-sm font-semibold text-gray-800 ml-1">4.9/5</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                <span className="text-sm">Trusted by 10,000+ clients</span>
              </div>
            </div>
          </div>
        </div>

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
            className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl z-50 transition-all cursor-pointer"
            title="Back to top"
          >
            <ChevronRight className="w-5 h-5 text-white -rotate-90" />
          </motion.button>
        )}
      </div>
    </footer>
  );
}