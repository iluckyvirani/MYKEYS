import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatCurrency(amount: number, currency: string = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(dateObj);
  } catch (error) {
    return "Invalid date";
  }
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "active":
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-800";
    case "completed":
    case "verified":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}