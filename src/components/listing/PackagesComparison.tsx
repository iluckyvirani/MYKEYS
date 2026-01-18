"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Heart,
  Home,
  Hotel,
  KeyRound,
  Mail,
  MessageCircle,
  Moon,
  PoundSterling,
  Scale,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

interface PackagesComparisonProps {
  propertyId: number;
  title: string;
  propertyType: string;
  address: string;
  
  // Transaction types available for this property
  availableTypes: {
    shortRent: boolean;
    longRent: boolean;
    purchase: boolean;
  };
  
  // Pricing for each type
  pricing: {
    shortRent?: {
      pricePerNight: number;
      cleaningFee: number;
      serviceFee: number;
      securityDeposit: number;
      minimumNights: number;
      maximumNights: number;
    };
    longRent?: {
      monthlyRent: number;
      securityDeposit: number;
      maintenanceFee: number;
      minimumMonths: number;
      maximumMonths: number;
      billsIncluded: boolean;
    };
    purchase?: {
      totalPrice: number;
      pricePerSqft: number;
      bookingAmount: number;
      negotiable: boolean;
    };
  };
  
  // Property details
  sqft: number;
  beds: number;
  baths: number;
  
  // User context (optional)
  userId?: string;
  isLoggedIn?: boolean;
}

export default function PackagesComparison({
  propertyId,
  title,
  propertyType,
  address,
  availableTypes,
  pricing,
  sqft,
  beds,
  baths,
  userId,
  isLoggedIn = false
}: PackagesComparisonProps) {
  const [activeTab, setActiveTab] = useState<"compare" | "packages">("compare");
  const [comparisonYears, setComparisonYears] = useState(5);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [nights, setNights] = useState<number>(2);
  const [months, setMonths] = useState<number>(12);
  const [guests, setGuests] = useState<number>(2);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryType, setInquiryType] = useState<"short" | "long" | "buy">("short");
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isLiked, setIsLiked] = useState(false);

  // Mock packages data
  const packages = {
    shortTerm: [
      {
        id: "short-premium",
        name: "Premium Short Rent",
        price: pricing.shortRent?.pricePerNight || 0,
        type: "short",
        features: [
          "Flexible check-in/out",
          "Premium cleaning included",
          "Concierge service",
          "Priority support",
          "Free cancellation up to 48h",
        ],
        commission: 15, // Platform commission %
        badge: "Most Popular",
      },
      {
        id: "short-standard",
        name: "Standard Short Rent",
        price: (pricing.shortRent?.pricePerNight || 0) * 0.9, // 10% less
        type: "short",
        features: [
          "Standard cleaning",
          "Self check-in",
          "Basic support",
          "Moderate cancellation policy",
        ],
        commission: 12,
      },
    ],
    longTerm: [
      {
        id: "long-premium",
        name: "Premium Long Term",
        price: pricing.longRent?.monthlyRent || 0,
        type: "long",
        features: [
          "Property management included",
          "Tenant screening service",
          "Maintenance coverage",
          "Legal documentation",
          "Monthly inspections",
        ],
        commission: 8,
        badge: "Best Value",
      },
      {
        id: "long-basic",
        name: "Basic Long Term",
        price: (pricing.longRent?.monthlyRent || 0) * 0.95, // 5% less
        type: "long",
        features: [
          "Basic listing only",
          "Owner handles everything",
          "Lead generation only",
          "Standard contract template",
        ],
        commission: 5,
      },
    ],
    purchase: [
      {
        id: "buy-premium",
        name: "Premium Sale Package",
        price: pricing.purchase?.totalPrice || 0,
        type: "buy",
        features: [
          "Professional photography",
          "3D virtual tour",
          "Featured listing placement",
          "Social media promotion",
          "Open house organization",
          "Negotiation assistance",
          "Legal document preparation",
        ],
        commission: 2.5,
        badge: "Fast Sale",
      },
      {
        id: "buy-standard",
        name: "Standard Sale Package",
        price: pricing.purchase?.totalPrice || 0,
        type: "buy",
        features: [
          "Basic photography",
          "Standard listing",
          "Lead management",
          "Basic documentation",
        ],
        commission: 1.5,
      },
      {
        id: "buy-express",
        name: "Express Sale",
        price: (pricing.purchase?.totalPrice || 0) * 0.98, // 2% discount for owner
        type: "buy",
        features: [
          "Premium everything",
          "Guaranteed sale in 30 days",
          "Cash buyer network",
          "Full legal support",
          "Home staging included",
        ],
        commission: 3.5,
        badge: "Guaranteed",
      },
    ],
  };

  // Calculate costs for comparison
  const calculateCosts = () => {
    const shortTermCost = pricing.shortRent
      ? (pricing.shortRent.pricePerNight * 365 / 12 * comparisonYears) + // Average nights per month
        (pricing.shortRent.serviceFee * 12 * comparisonYears)
      : 0;

    const longTermCost = pricing.longRent
      ? (pricing.longRent.monthlyRent * 12 * comparisonYears) +
        (!pricing.longRent.billsIncluded ? 200 * 12 * comparisonYears : 0) // Estimated bills
      : 0;

    const purchaseCost = pricing.purchase
      ? pricing.purchase.totalPrice
      : 0;

    const shortTermEquity = 0;
    const longTermEquity = 0;
    const purchaseEquity = pricing.purchase
      ? pricing.purchase.totalPrice * 0.03 * comparisonYears // 3% appreciation per year
      : 0;

    return {
      shortTerm: { cost: shortTermCost, equity: shortTermEquity },
      longTerm: { cost: longTermCost, equity: longTermEquity },
      purchase: { cost: purchaseCost, equity: purchaseEquity },
    };
  };

  const costs = calculateCosts();

  // Handle short-term booking calculation
  const calculateShortTermTotal = () => {
    if (!pricing.shortRent) return 0;
    
    const basePrice = pricing.shortRent.pricePerNight * nights;
    const total = basePrice + pricing.shortRent.cleaningFee + pricing.shortRent.serviceFee;
    return total;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In real app, send to API
    console.log("Inquiry submitted:", {
      propertyId,
      inquiryType,
      ...inquiryForm,
    });
    
    // Reset form and close modal
    setInquiryForm({ name: "", email: "", phone: "", message: "" });
    setShowInquiryModal(false);
    
    // Show success message
    alert(`Your ${inquiryType === "short" ? "booking inquiry" : "inquiry"} has been sent successfully!`);
  };

  const handleBookShortTerm = () => {
    if (!isLoggedIn) {
      // Redirect to login or show login modal
      alert("Please login to book");
      return;
    }
    
    const total = calculateShortTermTotal();
    // In real app, proceed to payment
    console.log("Booking short term:", {
      propertyId,
      checkInDate,
      checkOutDate,
      nights,
      guests,
      total,
    });
    
    alert(`Redirecting to payment for £${total}`);
  };

  const renderShortTermCalculator = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-[5px] text-sm"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => {
              setCheckOutDate(e.target.value);
              if (checkInDate) {
                const days = Math.ceil(
                  (new Date(e.target.value).getTime() - new Date(checkInDate).getTime()) / 
                  (1000 * 60 * 60 * 24)
                );
                setNights(days);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-[5px] text-sm"
            min={checkInDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nights
          </label>
          <div className="flex items-center border border-gray-300 rounded-[5px]">
            <button
              type="button"
              onClick={() => setNights(Math.max(pricing.shortRent?.minimumNights || 1, nights - 1))}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              -
            </button>
            <span className="flex-1 text-center text-sm">{nights} nights</span>
            <button
              type="button"
              onClick={() => setNights(nights + 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
              disabled={nights >= (pricing.shortRent?.maximumNights || 30)}
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guests
          </label>
          <div className="flex items-center border border-gray-300 rounded-[5px]">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              -
            </button>
            <span className="flex-1 text-center text-sm">{guests} guest{guests > 1 ? 's' : ''}</span>
            <button
              type="button"
              onClick={() => setGuests(guests + 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {pricing.shortRent && (
        <div className="bg-gray-50 rounded-[5px] p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>£{pricing.shortRent.pricePerNight} × {nights} nights</span>
            <span>£{(pricing.shortRent.pricePerNight * nights).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cleaning fee</span>
            <span>£{pricing.shortRent.cleaningFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>£{pricing.shortRent.serviceFee}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>£{calculateShortTermTotal().toFixed(2)}</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleBookShortTerm}
        className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Book Now
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Pay securely. Payment released to owner after check-in.
      </p>
    </div>
  );

  const renderLongTermCalculator = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rental Duration
        </label>
        <div className="flex gap-2 mb-4">
          {[6, 12, 18, 24].map((month) => (
            <button
              key={month}
              type="button"
              onClick={() => setMonths(month)}
              className={`flex-1 py-2 rounded-[5px] text-sm border ${
                months === month
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {month} months
            </button>
          ))}
        </div>
        <input
          type="range"
          min={pricing.longRent?.minimumMonths || 6}
          max={pricing.longRent?.maximumMonths || 36}
          value={months}
          onChange={(e) => setMonths(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Min: {pricing.longRent?.minimumMonths || 6} months</span>
          <span>Max: {pricing.longRent?.maximumMonths || 36} months</span>
        </div>
      </div>

      {pricing.longRent && (
        <div className="bg-gray-50 rounded-[5px] p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Monthly rent</span>
            <span>£{pricing.longRent.monthlyRent}/month</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Security deposit</span>
            <span>£{pricing.longRent.securityDeposit}</span>
          </div>
          {!pricing.longRent.billsIncluded && (
            <div className="flex justify-between text-sm">
              <span>Estimated bills (monthly)</span>
              <span>£200</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>First payment</span>
            <span>£{(pricing.longRent.monthlyRent + pricing.longRent.securityDeposit).toFixed(2)}</span>
          </div>
        </div>
      )}

      <Button
        onClick={() => {
          setInquiryType("long");
          setShowInquiryModal(true);
        }}
        className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Send Rental Inquiry
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Owner will contact you directly to finalize terms.
      </p>
    </div>
  );

  const renderPurchaseCalculator = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Down Payment
        </label>
        <div className="flex gap-2 mb-4">
          {[10, 20, 30, 40].map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => {/* Set down payment state */}}
              className={`flex-1 py-2 rounded-[5px] text-sm border ${
                percent === 20
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {percent}%
            </button>
          ))}
        </div>
      </div>

      {pricing.purchase && (
        <div className="bg-gray-50 rounded-[5px] p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Property price</span>
            <span>£{pricing.purchase.totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Stamp duty (estimated)</span>
            <span>£{(pricing.purchase.totalPrice * 0.05).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Legal fees (estimated)</span>
            <span>£2,000</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total initial cost</span>
            <span>£{(pricing.purchase.totalPrice * 1.07).toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button
        onClick={() => {
          setInquiryType("buy");
          setShowInquiryModal(true);
        }}
        className="w-full bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 cursor-pointer"
      >
        <Scale className="w-4 h-4 mr-2" />
        I'm Interested in Buying
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Schedule a viewing or request more information.
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-[5px] shadow-lg border p-6 mb-8">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Smart Options Comparison
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Compare different ways to use this property
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "compare" | "packages")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-[5px]">
            <TabsTrigger value="compare" className="rounded-[5px] text-sm">
              Compare Options
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-[5px] text-sm">
              Owner Packages
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "compare" ? (
        /* COMPARE OPTIONS TAB */
        <div className="space-y-6">
          {/* Timeframe Selector */}
          <div className="bg-gray-50 rounded-[5px] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Compare costs over:</span>
              <span className="text-lg font-bold">{comparisonYears} years</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={comparisonYears}
              onChange={(e) => setComparisonYears(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 year</span>
              <span>5 years</span>
              <span>10 years</span>
            </div>
          </div>

          {/* Three Columns Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Short Term Column */}
            {availableTypes.shortRent && (
              <div className="border rounded-[5px] p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Hotel className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Short Rent</h4>
                      <p className="text-xs text-gray-500">Airbnb-style</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    £{pricing.shortRent?.pricePerNight}/night
                  </span>
                </div>

                {renderShortTermCalculator()}

                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total {comparisonYears} year cost:</span>
                      <span className="font-semibold">£{costs.shortTerm.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Equity built:</span>
                      <span className="font-semibold text-gray-500">£0</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Flexibility to move</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>No maintenance costs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <X className="w-4 h-4" />
                      <span>No equity buildup</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Long Term Column */}
            {availableTypes.longRent && (
              <div className="border rounded-[5px] p-4 hover:border-orange-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Home className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Long Term</h4>
                      <p className="text-xs text-gray-500">Traditional rental</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-700">
                    £{pricing.longRent?.monthlyRent}/month
                  </span>
                </div>

                {renderLongTermCalculator()}

                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total {comparisonYears} year cost:</span>
                      <span className="font-semibold">£{costs.longTerm.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Equity built:</span>
                      <span className="font-semibold text-gray-500">£0</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Stable monthly cost</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>More space than hotel</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <X className="w-4 h-4" />
                      <span>Long-term commitment</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Column */}
            {availableTypes.purchase && (
              <div className="border rounded-[5px] p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Purchase</h4>
                      <p className="text-xs text-gray-500">Ownership</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-700">
                    £{pricing.purchase?.totalPrice.toLocaleString()}
                  </span>
                </div>

                {renderPurchaseCalculator()}

                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total investment:</span>
                      <span className="font-semibold">£{costs.purchase.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Equity built ({comparisonYears} years):</span>
                      <span className="font-semibold text-green-600">
                        +£{costs.purchase.equity.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Build equity over time</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Potential rental income</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <X className="w-4 h-4" />
                      <span>Large upfront investment</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-[5px] p-4">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Smart Recommendation</h4>
            </div>
            <p className="text-green-700 text-sm">
              Based on current market trends and your profile,{" "}
              <span className="font-semibold">Short Rent</span> provides the best value with 
              maximum flexibility and 30% lower cost over {comparisonYears} years compared to ownership.
            </p>
          </div>
        </div>
      ) : (
        /* OWNER PACKAGES TAB */
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-gray-50 rounded-[5px] p-4">
            <h4 className="font-semibold mb-2">For Property Owners</h4>
            <p className="text-sm text-gray-600">
              Choose from our professional packages to maximize your property's potential. 
              Each package includes different levels of service and marketing support.
            </p>
          </div>

          {/* Short Term Packages */}
          {availableTypes.shortRent && (
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Hotel className="w-4 h-4 text-blue-600" />
                Short Rent Packages
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.shortTerm.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-[5px] p-4 hover:shadow-md transition-shadow ${
                      selectedPackage === pkg.id ? "border-blue-500 ring-2 ring-blue-100" : ""
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold">{pkg.name}</h5>
                        <p className="text-xs text-gray-500">Platform fee: {pkg.commission}%</p>
                      </div>
                      {pkg.badge && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant={selectedPackage === pkg.id ? "default" : "outline"}
                      className="w-full cursor-pointer"
                    >
                      Select Package
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Long Term Packages */}
          {availableTypes.longRent && (
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Home className="w-4 h-4 text-orange-600" />
                Long Term Rental Packages
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.longTerm.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-[5px] p-4 hover:shadow-md transition-shadow ${
                      selectedPackage === pkg.id ? "border-orange-500 ring-2 ring-orange-100" : ""
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold">{pkg.name}</h5>
                        <p className="text-xs text-gray-500">Platform fee: {pkg.commission}%</p>
                      </div>
                      {pkg.badge && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant={selectedPackage === pkg.id ? "default" : "outline"}
                      className="w-full cursor-pointer"
                    >
                      Select Package
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Packages */}
          {availableTypes.purchase && (
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Sale Packages
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.purchase.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-[5px] p-4 hover:shadow-md transition-shadow ${
                      selectedPackage === pkg.id ? "border-purple-500 ring-2 ring-purple-100" : ""
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold">{pkg.name}</h5>
                        <p className="text-xs text-gray-500">Commission: {pkg.commission}%</p>
                      </div>
                      {pkg.badge && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant={selectedPackage === pkg.id ? "default" : "outline"}
                      className="w-full cursor-pointer"
                    >
                      Select Package
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Summary */}
          {selectedPackage && (
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-[5px] p-4">
              <h4 className="font-semibold mb-3">Selected Package Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold">
                    {[...packages.shortTerm, ...packages.longTerm, ...packages.purchase]
                      .find(p => p.id === selectedPackage)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee:</span>
                  <span className="font-semibold">
                    {[...packages.shortTerm, ...packages.longTerm, ...packages.purchase]
                      .find(p => p.id === selectedPackage)?.commission}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Support level:</span>
                  <span className="font-semibold">Premium</span>
                </div>
              </div>
              <Button className="w-full mt-4 cursor-pointer">
                Proceed with Package
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[5px] shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {inquiryType === "short" ? "Booking Inquiry" : 
                 inquiryType === "long" ? "Rental Inquiry" : "Purchase Inquiry"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInquiryModal(false)}
                className="cursor-pointer"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              {!isLoggedIn && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-[5px] text-sm"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-[5px] text-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-[5px] text-sm"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <textarea
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[5px] text-sm h-32"
                  placeholder={
                    inquiryType === "short"
                      ? "Tell us about your stay plans..."
                      : inquiryType === "long"
                      ? "I'm interested in renting this property. Please provide availability and terms..."
                      : "I'm interested in buying this property. Please schedule a viewing..."
                  }
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Inquiry
              </Button>

              <p className="text-xs text-gray-500 text-center">
                {inquiryType === "short"
                  ? "Your inquiry will be processed immediately for booking."
                  : "Your inquiry will be sent directly to the property owner."}
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}