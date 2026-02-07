"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, User, LogIn, LogOut, Menu, X, ChevronDown, LayoutDashboard, User as UserIcon, Building2, HelpCircle, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const router = useRouter();

  // Fixed: Improved scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50; // Changed from 10 to 50 for better UX
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Simulating authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);

      const role = localStorage.getItem("user_role") || "user";
      setUserRole(role);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user_role");
    setIsLoggedIn(false);
    setUserRole("user");
  };

  const switchDashboard = (role: "user" | "owner") => {
    setUserRole(role);
    localStorage.setItem("user_role", role);
    setShowDashboardDropdown(false);

    // ✅ role-based navigation
    router.push(`/${role}/dashboard`);
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/buy", label: "Buy" },
    { href: "/rent/short-rent", label: "Short Rent" },
    { href: "/rent/long-rent", label: "Long Rent" },
    { href: "/how-listing-works", label: "List Property", icon: HelpCircle },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white shadow-lg py-3" // Changed to solid white when scrolled
          : "bg-transparent py-5"
          }`}
        style={{
          backdropFilter: scrolled ? "blur(8px)" : "none",
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${scrolled
                  ? "bg-linear-to-br from-green-500 to-emerald-600"
                  : "bg-white/10 backdrop-blur-sm"
                  }`}>
                  <Key className={`w-5 h-5 ${scrolled ? 'text-white' : 'text-white'}`} />
                </div>
                <span
                  className={`text-2xl font-bold transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"
                    }`}
                >
                  MYKEYS
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-sm font-medium transition-colors hover:text-green-600 ${scrolled ? "text-gray-700" : "text-white/90"
                    }`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-4">
              {/* FIXED: Corrected conditional logic */}
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  {/* Dashboard Dropdown */}
                  <div className="relative">
                    <Button
                      variant={scrolled ? "outline" : "ghost"}
                      className={`flex items-center gap-2 cursor-pointer ${scrolled
                        ? "text-gray-700 border-gray-300 hover:bg-gray-100"
                        : "text-white/90 hover:bg-white/30"
                        }`}
                      onClick={() => setShowDashboardDropdown(!showDashboardDropdown)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDashboardDropdown ? "rotate-180" : ""
                        }`} />
                    </Button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDashboardDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-50 bg-white rounded-[5px] shadow-lg border border-gray-200 overflow-hidden z-50"
                          onMouseLeave={() => setShowDashboardDropdown(false)}
                        >
                          <button
                            onClick={() => switchDashboard("user")}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${userRole === "user" ? "bg-green-100 text-green-600" : "text-gray-700"
                              }`}
                          >
                            <UserIcon className="w-4 h-4" />
                            <div>
                              <p className="font-medium">User Dashboard</p>
                              <p className="text-xs text-gray-500">Bookings & Inquiries</p>
                            </div>
                          </button>

                          <button
                            onClick={() => switchDashboard("owner")}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${userRole === "owner" ? "bg-green-50 text-green-600" : "text-gray-700"
                              }`}
                          >
                            <Building2 className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Owner Dashboard</p>
                              <p className="text-xs text-gray-500">Manage Properties</p>
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Logout */}
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className={`hidden sm:flex items-center gap-2 rounded-[5px] cursor-pointer ${scrolled
                      ? "text-gray-700 hover:bg-gray-50"
                      : "text-white hover:bg-white"
                      }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  {/* Login and Signup buttons */}
                  <Link href="/login">
                    <Button
                      variant={scrolled ? "outline" : "ghost"}
                      className={`hidden sm:flex items-center gap-2 cursor-pointer rounded-[5px] ${scrolled
                        ? "text-gray-700 border-gray-300 hover:bg-gray-50"
                        : "text-white/90 hover:bg-white"
                        }`}
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="hidden sm:flex bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 rounded-[5px]">
                      <User className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className={`w-6 h-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full pt-20 pb-6">
                <div className="flex-1 overflow-y-auto px-4">
                  {/* Mobile Navigation Items */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="mt-8 border-t pt-6">
                    {!isLoggedIn ? (
                      <>
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">DASHBOARD</p>
                          <Link
                            href="user/dashboard"
                            className="block py-3 px-4 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors mb-2"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <UserIcon className="w-4 h-4" />
                              User Dashboard
                            </div>
                          </Link>
                          <Link
                            href="owner/dashboard"
                            className="block py-3 px-4 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="w-4 h-4" />
                              Owner Dashboard
                            </div>
                          </Link>
                        </div>

                        <Link
                          href="/profile"
                          className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mb-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Profile Settings
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mb-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/signup"
                          className="block py-3 px-4 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}