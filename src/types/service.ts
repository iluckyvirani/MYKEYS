// Service Types
export type ServiceCategory = 
  | "plumbing" 
  | "cleaning" 
  | "ac-repair" 
  | "electrical" 
  | "painting" 
  | "carpentry"
  | "appliance-repair";

export interface ServiceSubcategory {
  id: string;
  name: string;
  category: ServiceCategory;
}

export type BookingType = "instant" | "scheduled";
export type BookingStatus = "pending" | "confirmed" | "on-the-way" | "in-progress" | "completed" | "cancelled";

export interface ServiceProvider {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  category: ServiceCategory;
  subcategories: ServiceSubcategory[];
  serviceAreas: string[];
  rating: number;
  totalReviews: number;
  instantBookingEnabled: boolean;
  instantBookingPrice?: number;
  documentVerified: boolean;
  documentsUrl?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceBooking {
  id: string;
  userId: string;
  serviceProviderId: string;
  serviceProvider?: ServiceProvider;
  category: ServiceCategory;
  subcategory: ServiceSubcategory;
  serviceArea: string;
  bookingType: BookingType;
  scheduledDate?: Date;
  scheduledTime?: string;
  description?: string;
  status: BookingStatus;
  paymentStatus: "pending" | "completed" | "failed";
  totalAmount: number;
  paymentId?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceReview {
  id: string;
  bookingId: string;
  userId: string;
  serviceProviderId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service Categories with Subcategories
export const SERVICE_CATEGORIES = {
  plumbing: {
    label: "Plumbing",
    icon: "Wrench",
    subcategories: [
      { id: "pipe-repair", name: "Pipe Repair" },
      { id: "tap-repair", name: "Tap Repair" },
      { id: "drain-cleaning", name: "Drain Cleaning" },
      { id: "toilet-installation", name: "Toilet Installation" },
    ],
  },
  cleaning: {
    label: "Cleaning",
    icon: "Sparkles",
    subcategories: [
      { id: "home-cleaning", name: "Home Cleaning" },
      { id: "office-cleaning", name: "Office Cleaning" },
      { id: "carpet-cleaning", name: "Carpet Cleaning" },
      { id: "window-cleaning", name: "Window Cleaning" },
    ],
  },
  "ac-repair": {
    label: "AC Repair",
    icon: "Wind",
    subcategories: [
      { id: "installation", name: "Installation" },
      { id: "repair", name: "Repair" },
      { id: "maintenance", name: "Maintenance" },
      { id: "gas-refill", name: "Gas Refill" },
    ],
  },
  electrical: {
    label: "Electrical",
    icon: "Zap",
    subcategories: [
      { id: "wiring", name: "Wiring" },
      { id: "switch-repair", name: "Switch Repair" },
      { id: "appliance-repair", name: "Appliance Repair" },
      { id: "light-installation", name: "Light Installation" },
    ],
  },
  painting: {
    label: "Painting",
    icon: "Paintbrush",
    subcategories: [
      { id: "wall-painting", name: "Wall Painting" },
      { id: "exterior-painting", name: "Exterior Painting" },
      { id: "furniture-painting", name: "Furniture Painting" },
      { id: "texture-coating", name: "Texture Coating" },
    ],
  },
  carpentry: {
    label: "Carpentry",
    icon: "Hammer",
    subcategories: [
      { id: "door-installation", name: "Door Installation" },
      { id: "cabinet-repair", name: "Cabinet Repair" },
      { id: "furniture-repair", name: "Furniture Repair" },
      { id: "shelving", name: "Shelving" },
    ],
  },
  "appliance-repair": {
    label: "Appliance Repair",
    icon: "Wrench",
    subcategories: [
      { id: "washing-machine", name: "Washing Machine" },
      { id: "microwave", name: "Microwave" },
      { id: "refrigerator", name: "Refrigerator" },
      { id: "oven", name: "Oven" },
    ],
  },
};

// Price tiers for instant booking
export const INSTANT_BOOKING_PRICES: Record<ServiceCategory, number> = {
  plumbing: 500,
  cleaning: 300,
  "ac-repair": 800,
  electrical: 600,
  painting: 1000,
  carpentry: 700,
  "appliance-repair": 600,
};
