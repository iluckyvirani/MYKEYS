"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, User, LogIn, LogOut, Menu, X, ChevronDown, LayoutDashboard, User as UserIcon, Building2, HelpCircle, Key, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserDTO } from "@/types/auth";
import { api } from "@/lib/api";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const [showBecomeOwnerModal, setShowBecomeOwnerModal] = useState(false);
  const [becomingOwner, setBecomingOwner] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr) as UserDTO;
          setIsLoggedIn(true);
          setUser(userData);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    router.push("/");
  };

  const handleBecomeOwner = async () => {
    setBecomingOwner(true);
    setErrorMessage("");
    try {
      const response = await api.post("/users/become-owner");
      
      // Update user data in localStorage with new roles
      if (response.data?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        setUser(response.data.data.user);
      }

      setShowBecomeOwnerModal(false);
      setSuccessMessage("You are now an owner! You can start listing properties.");
      setShowSuccessModal(true);

      // Auto-close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error becoming owner:", error);
      const message = error.response?.data?.message || "Failed to become owner. Please try again.";
      setErrorMessage(message);
    } finally {
      setBecomingOwner(false);
    }
  };

  const hasOwnerRole = user?.roles?.includes("OWNER");

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
              {isLoggedIn && user ? (
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
                          className="absolute right-0 mt-2 w-56 bg-white rounded-[5px] shadow-lg border border-gray-200 overflow-hidden z-50"
                          onMouseLeave={() => setShowDashboardDropdown(false)}
                        >
                          {/* User Dashboard */}
                          <Link
                            href="/user/dashboard"
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100`}
                            onClick={() => setShowDashboardDropdown(false)}
                          >
                            <UserIcon className="w-4 h-4" />
                            <div>
                              <p className="font-medium">User Dashboard</p>
                              <p className="text-xs text-gray-500">Bookings & Inquiries</p>
                            </div>
                          </Link>

                          {/* Owner Dashboard */}
                          {hasOwnerRole ? (
                            <Link
                              href="/owner/dashboard"
                              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100`}
                              onClick={() => setShowDashboardDropdown(false)}
                            >
                              <Building2 className="w-4 h-4" />
                              <div>
                                <p className="font-medium">Owner Dashboard</p>
                                <p className="text-xs text-gray-500">Manage Properties</p>
                              </div>
                            </Link>
                          ) : (
                            <button
                              onClick={() => {
                                setShowBecomeOwnerModal(true);
                                setShowDashboardDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-green-50 transition-colors cursor-pointer text-green-600 border-b border-gray-100`}
                            >
                              <Building2 className="w-4 h-4" />
                              <div>
                                <p className="font-medium">Become Owner</p>
                                <p className="text-xs">Start listing properties</p>
                              </div>
                            </button>
                          )}
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

      {/* Become Owner Modal */}
      <AnimatePresence>
        {showBecomeOwnerModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBecomeOwnerModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-bold mb-2">Become an Owner</h3>
              <p className="text-gray-600 mb-6">
                Unlock the ability to list properties and grow your rental business. Click the button below to get started!
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowBecomeOwnerModal(false)}
                  variant="outline"
                  className="flex-1 rounded-[5px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBecomeOwner}
                  disabled={becomingOwner}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
                >
                  {becomingOwner ? "Processing..." : "Become Owner"}
                </Button>
              </div>
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-[5px]">
                  {errorMessage}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 max-w-sm w-full mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Success!</h3>
                <p className="text-gray-600 mb-6">
                  {successMessage}
                </p>
                
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
                >
                  Got it!
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    {isLoggedIn && user ? (
                      <>
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">DASHBOARD</p>
                          <Link
                            href="/user/dashboard"
                            className="block py-3 px-4 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors mb-2"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <UserIcon className="w-4 h-4" />
                              User Dashboard
                            </div>
                          </Link>
                          
                          {hasOwnerRole ? (
                            <Link
                              href="/owner/dashboard"
                              className="block py-3 px-4 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors mb-2"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4" />
                                Owner Dashboard
                              </div>
                            </Link>
                          ) : (
                            <button
                              onClick={() => {
                                setShowBecomeOwnerModal(true);
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left py-3 px-4 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors mb-2"
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4" />
                                Become Owner
                              </div>
                            </button>
                          )}
                        </div>

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