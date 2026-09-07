import { SERVICE_CATEGORIES, ServiceCategory, INSTANT_BOOKING_PRICES } from "@/types/service";

/**
 * Get the display label for a service category
 */
export const getCategoryLabel = (category: ServiceCategory): string => {
  return SERVICE_CATEGORIES[category]?.label || category;
};

/**
 * Get default price for instant booking
 */
export const getInstantBookingPrice = (category: ServiceCategory): number => {
  return INSTANT_BOOKING_PRICES[category] || 500;
};

/**
 * Format date to readable format
 */
export const formatServiceDate = (date: string): string => {
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

/**
 * Get all subcategories for a service category
 */
export const getSubcategories = (category: ServiceCategory) => {
  return SERVICE_CATEGORIES[category]?.subcategories || [];
};

/**
 * Validate service booking data
 */
export const validateServiceBooking = (
  bookingType: "instant" | "scheduled",
  formData: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Common validation
  if (!formData.name?.trim()) errors.push("Name is required");
  if (!formData.phone?.trim()) errors.push("Phone number is required");
  if (!formData.address?.trim()) errors.push("Service address is required");
  if (!formData.serviceArea?.trim()) errors.push("Service area is required");

  // Scheduled booking validation
  if (bookingType === "scheduled") {
    if (!formData.date) errors.push("Date is required");
    if (!formData.time) errors.push("Time is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Format currency amount
 */
export const formatAmount = (amount: number): string => {
  return `£${amount.toLocaleString("en-GB")}`;
};

/**
 * Get booking status badge color
 */
export const getStatusBadgeColor = (
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled"
): string => {
  const colors = {
    pending: "bg-gray-100 text-gray-800",
    confirmed: "bg-blue-100 text-blue-800",
    "in-progress": "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Generate booking ID
 */
export const generateBookingId = (): string => {
  return `BK${Date.now().toString().slice(-8).toUpperCase()}`;
};
