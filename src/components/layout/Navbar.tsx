"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  Building2,
  CheckCircle,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { UserDTO } from "@/types/auth";
import { api } from "@/lib/api";

type MegaMenu = "rent" | "inspire" | "dashboard" | null;

const rentLinks = [
  { href: "/rent/whole-property", label: "Whole Property" },
  { href: "/rent/room-to-rent", label: "Room to Rent" },
];

const inspireColumns = [
  [
    { href: "/inspire/moving-stories", label: "Moving stories" },
    { href: "/inspire/property-news", label: "Property news" },
    { href: "/inspire/energy-efficiency", label: "Energy efficiency" },
  ],
  [
    { href: "/inspire/property-guides", label: "Property guides" },
    { href: "/inspire/housing-trends", label: "Housing trends" },
    { href: "/inspire/mortgage-guides", label: "Mortgage guides" },
  ],
  [
    { href: "/inspire/overseas-blog", label: "Overseas blog" },
    { href: "/inspire/country-guides", label: "Country guides" },
    { href: "/inspire/find-agent", label: "Find agent" },
  ],
];

const inspireLinks = inspireColumns.flat();

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileRentOpen, setMobileRentOpen] = useState(false);
  const [mobileInspireOpen, setMobileInspireOpen] = useState(false);
  const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [openMenu, setOpenMenu] = useState<MegaMenu>(null);
  const [showBecomeOwnerModal, setShowBecomeOwnerModal] = useState(false);
  const [becomingOwner, setBecomingOwner] = useState(false);
  const [showBecomeServiceModal, setShowBecomeServiceModal] = useState(false);
  const [becomingService, setBecomingService] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        try {
          setIsLoggedIn(true);
          setUser(JSON.parse(userStr) as UserDTO);
        } catch {
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setOpenMenu(null);
    router.push("/");
  };

  const handleBecomeOwner = async () => {
    setBecomingOwner(true);
    setErrorMessage("");
    try {
      const response = await api.post("/users/become-owner");
      if (response.data?.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
      }
      if (response.data?.data?.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }
      if (response.data?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        setUser(response.data.data.user);
      }
      setShowBecomeOwnerModal(false);
      setSuccessMessage("You are now a Seller/Landlord! You can start listing properties.");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to become owner. Please try again."
      );
    } finally {
      setBecomingOwner(false);
    }
  };

  const handleBecomeService = async () => {
    router.push("/services?register=true");
    setShowBecomeServiceModal(false);
  };

  const hasOwnerRole = Boolean(
    user?.roles?.some((role) => role === "OWNER")
  );
  const hasServiceRole = Boolean(
    user?.roles?.some((role) => role === "SERVICE")
  );

  const linkClass = (active: boolean) =>
    `relative px-3 py-2 text-sm font-semibold rounded-md transition-colors ${active
      ? "bg-gray-100 text-slate-900"
      : "text-slate-800 hover:bg-gray-100 hover:text-slate-900"
    }`;

  const underlineClass = (active: boolean) =>
    `absolute left-3 right-3 -bottom-0.5 h-0.5 bg-slate-900 transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    }`;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 w-full z-50 transition-shadow duration-300 bg-white ${scrolled || openMenu ? "shadow-md" : "shadow-sm"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between h-[72px] md:h-[80px]">
            <Link
              href="/"
              className="flex items-center shrink-0"
              onClick={() => setOpenMenu(null)}
              aria-label="MYKEYS home"
            >
              <img
                src="/mykeys-logo-nav.png"
                alt="MYKEYS"
                width={310}
                height={128}
                className="h-[45px] w-auto object-contain"
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1 ml-auto mr-4">
              <Link href="/buy" className={`group ${linkClass(pathname === "/buy")}`}>
                BUY
                <span className={underlineClass(pathname === "/buy")} />
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setOpenMenu("rent")}
                onMouseLeave={() => setOpenMenu((m) => (m === "rent" ? null : m))}
              >
                <button
                  type="button"
                  className={`group ${linkClass(
                    pathname.startsWith("/rent/whole-property") ||
                      pathname.startsWith("/rent/room-to-rent") ||
                      pathname.startsWith("/rent/long-rent") ||
                      openMenu === "rent"
                  )}`}
                  onClick={() => setOpenMenu(openMenu === "rent" ? null : "rent")}
                  aria-expanded={openMenu === "rent"}
                >
                  Rent
                  <span
                    className={underlineClass(
                      openMenu === "rent" ||
                        pathname.startsWith("/rent/whole-property") ||
                        pathname.startsWith("/rent/room-to-rent") ||
                        pathname.startsWith("/rent/long-rent")
                    )}
                  />
                </button>
              </div>

              <Link
                href="/rent/short-rent"
                className={`group ${linkClass(pathname.startsWith("/rent/short-rent"))}`}
              >
                Short Stay
                <span className={underlineClass(pathname.startsWith("/rent/short-rent"))} />
              </Link>

              <Link href="/services" className={`group ${linkClass(pathname.startsWith("/services"))}`}>
                Services
                <span className={underlineClass(pathname.startsWith("/services"))} />
              </Link>

              <Link
                href="/how-listing-works"
                className={`group ${linkClass(pathname.startsWith("/how-listing-works"))}`}
              >
                List Property
                <span className={underlineClass(pathname.startsWith("/how-listing-works"))} />
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setOpenMenu("inspire")}
                onMouseLeave={() => setOpenMenu((m) => (m === "inspire" ? null : m))}
              >
                <button
                  type="button"
                  className={`group ${linkClass(
                    pathname.startsWith("/inspire") || openMenu === "inspire"
                  )}`}
                  onClick={() => setOpenMenu(openMenu === "inspire" ? null : "inspire")}
                  aria-expanded={openMenu === "inspire"}
                >
                  Inspire
                  <span className={underlineClass(openMenu === "inspire" || pathname.startsWith("/inspire"))} />
                </button>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {isLoggedIn && user ? (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu(openMenu === "dashboard" ? null : "dashboard")
                    }
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 border border-green-500 rounded-full hover:bg-green-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    MY KEY Dashboard
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openMenu === "dashboard" ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openMenu === "dashboard" && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        <Link
                          href="/user/dashboard"
                          className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100"
                          onClick={() => setOpenMenu(null)}
                        >
                          <UserIcon className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="font-medium text-slate-900">Tenant</p>
                            <p className="text-xs text-gray-500">Bookings & inquiries</p>
                          </div>
                        </Link>

                        {hasOwnerRole ? (
                          <Link
                            href="/owner/dashboard"
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100"
                            onClick={() => setOpenMenu(null)}
                          >
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-slate-900">Seller/Landlord</p>
                              <p className="text-xs text-gray-500">Manage properties</p>
                            </div>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowBecomeOwnerModal(true);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-green-50 text-green-700 border-b border-gray-100"
                          >
                            <Building2 className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Become Seller/Landlord</p>
                              <p className="text-xs">Start listing properties</p>
                            </div>
                          </button>
                        )}

                        {hasServiceRole ? (
                          <Link
                            href="/service/dashboard"
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                            onClick={() => setOpenMenu(null)}
                          >
                            <Wrench className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="font-medium text-slate-900">Professional/Associates</p>
                              <p className="text-xs text-gray-500">Manage services</p>
                            </div>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowBecomeServiceModal(true);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-purple-50 text-purple-700"
                          >
                            <Wrench className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Become Professional/Associate</p>
                              <p className="text-xs">Offer your services</p>
                            </div>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-600 border-t border-gray-100"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="cursor-pointer">
                    <Button
                      variant="outline"
                      className="cursor-pointer rounded-full border-green-500 text-slate-800 hover:bg-green-50"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="cursor-pointer">
                    <Button className="cursor-pointer rounded-full bg-green-600 hover:bg-green-700 text-white">
                      <User className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-800" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-800" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop mega menus */}
        <AnimatePresence>
          {(openMenu === "rent" || openMenu === "inspire") && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="hidden lg:block absolute left-0 right-0 top-full bg-gray-50 border-t border-gray-200 shadow-lg"
              onMouseEnter={() => setOpenMenu(openMenu)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
                {openMenu === "rent" && (
                  <div className="grid grid-cols-3 gap-8 max-w-3xl">
                    {rentLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="text-base font-semibold text-slate-800 hover:text-green-600 transition-colors"
                        onClick={() => setOpenMenu(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
                {openMenu === "inspire" && (
                  <div className="grid grid-cols-3 gap-x-12 gap-y-5 max-w-4xl">
                    {inspireColumns.map((column, colIndex) => (
                      <div key={colIndex} className="flex flex-col gap-5">
                        {column.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="text-base font-semibold text-slate-800 hover:text-green-600 transition-colors cursor-pointer"
                            onClick={() => setOpenMenu(null)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              <h3 className="text-xl font-bold mb-2">Become a Seller/Landlord</h3>
              <p className="text-gray-600 mb-6">
                Unlock the ability to list properties and grow your business.
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
                  {becomingOwner ? "Processing..." : "Continue"}
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

      {/* Become Service Modal */}
      <AnimatePresence>
        {showBecomeServiceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBecomeServiceModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-bold mb-2">Become a Professional/Associate</h3>
              <p className="text-gray-600 mb-6">
                Offer your professional services and connect with customers on MYKEYS.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowBecomeServiceModal(false)}
                  variant="outline"
                  className="flex-1 rounded-[5px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBecomeService}
                  disabled={becomingService}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-[5px]"
                >
                  {becomingService ? "Processing..." : "Register Now"}
                </Button>
              </div>
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
                <p className="text-gray-600 mb-6">{successMessage}</p>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full pt-20 pb-6 overflow-y-auto">
                <div className="px-4 space-y-1">
                  <Link
                    href="/buy"
                    className="block py-3 px-4 rounded-lg font-semibold text-slate-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    BUY
                  </Link>

                  <button
                    type="button"
                    className="w-full flex items-center justify-between py-3 px-4 rounded-lg font-semibold text-slate-800 hover:bg-gray-100"
                    onClick={() => setMobileRentOpen(!mobileRentOpen)}
                  >
                    Rent
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileRentOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileRentOpen && (
                    <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
                      {rentLinks.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block py-2 px-3 text-sm text-slate-700 hover:text-green-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/rent/short-rent"
                    className="block py-3 px-4 rounded-lg font-semibold text-slate-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Short Stay
                  </Link>
                  <Link
                    href="/services"
                    className="block py-3 px-4 rounded-lg font-semibold text-slate-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    href="/how-listing-works"
                    className="block py-3 px-4 rounded-lg font-semibold text-slate-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    List Property
                  </Link>

                  <button
                    type="button"
                    className="w-full flex items-center justify-between py-3 px-4 rounded-lg font-semibold text-slate-800 hover:bg-gray-100"
                    onClick={() => setMobileInspireOpen(!mobileInspireOpen)}
                  >
                    Inspire
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileInspireOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileInspireOpen && (
                    <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
                      {inspireLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block py-2 px-3 text-sm text-slate-700 hover:text-green-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t px-4 pt-4">
                  {isLoggedIn && user ? (
                    <>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between py-3 px-4 rounded-lg font-semibold text-slate-800 bg-green-50 border border-green-200"
                        onClick={() => setMobileDashboardOpen(!mobileDashboardOpen)}
                      >
                        MY KEY Dashboard
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileDashboardOpen ? "rotate-180" : ""}`} />
                      </button>
                      {mobileDashboardOpen && (
                        <div className="mt-2 space-y-1">
                          <Link
                            href="/user/dashboard"
                            className="block py-3 px-4 rounded-lg text-slate-800 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Tenant
                          </Link>
                          {hasOwnerRole ? (
                            <Link
                              href="/owner/dashboard"
                              className="block py-3 px-4 rounded-lg text-slate-800 hover:bg-gray-50"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Seller/Landlord
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="w-full text-left py-3 px-4 rounded-lg text-green-700 hover:bg-green-50"
                              onClick={() => {
                                setShowBecomeOwnerModal(true);
                                setMobileMenuOpen(false);
                              }}
                            >
                              Become Seller/Landlord
                            </button>
                          )}
                          {hasServiceRole ? (
                            <Link
                              href="/service/dashboard"
                              className="block py-3 px-4 rounded-lg text-slate-800 hover:bg-gray-50"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Professional/Associates
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="w-full text-left py-3 px-4 rounded-lg text-purple-700 hover:bg-purple-50"
                              onClick={() => {
                                setShowBecomeServiceModal(true);
                                setMobileMenuOpen(false);
                              }}
                            >
                              Become Professional/Associate
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="mt-3 w-full text-left py-3 px-4 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block py-3 px-4 rounded-lg text-slate-800 hover:bg-gray-100 mb-2 cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="block py-3 px-4 rounded-lg bg-green-600 text-white text-center font-medium cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
