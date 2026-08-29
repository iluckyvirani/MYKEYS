// Phase 1: Fully dynamic packages — no fixed tiers
export type DurationUnit = 'days' | 'months' | 'years';

/** SALE = Buy listings · RENT = Long-let rentals (short stay needs no package) */
export type PackageCategory = 'SALE' | 'RENT';

/** OWNER = landlord packages · AGENT = estate agent packages */
export type PackageAudience = 'OWNER' | 'AGENT';

export type PackageInput = {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  durationValue: number;  // e.g. 10, 1, 6
  durationUnit: DurationUnit; // "days" | "months" | "years"
  isActive?: boolean;
  category?: PackageCategory;
  audience?: PackageAudience;

  // Core features
  propertyLimit?: number; // 0 = unlimited
  featuredLimit?: number;

  // Contact / visibility flags
  showOwnerName?: boolean;
  showOwnerPhone?: boolean;
  directInquiryToOwner?: boolean;
  adminCCOnInquiry?: boolean;
  fullAdminSupport?: boolean;
  docExpiryAlert?: boolean;
};

export type PackageRecord = PackageInput & {
  id: string;
  category: PackageCategory;
  audience: PackageAudience;
  createdAt: string;
  updatedAt: string;
};

export type OwnerPackageWithUsage = {
  id: string;
  packageId: string;
  ownerId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startDate: string;
  endDate: string;
  nextBilling?: string;
  daysRemaining: number;

  // Usage
  propertiesUsed: number;
  propertiesLimit: number; // 0 = unlimited
  featuredUsed: number;
  featuredLimit: number;

  // Package Details
  packageName: string;
  price: number;
  durationValue: number;
  durationUnit: DurationUnit;
  shortDescription?: string;
  category: PackageCategory;

  // Feature flags
  showOwnerName: boolean;
  showOwnerPhone: boolean;
  directInquiryToOwner: boolean;
  adminCCOnInquiry: boolean;
  fullAdminSupport: boolean;
  docExpiryAlert: boolean;
};

export type OwnerActivePackages = {
  SALE: OwnerPackageWithUsage | null;
  RENT: OwnerPackageWithUsage | null;
};

export type AdminSettings = {
  id: string;
  shortRentCommissionPercent: number;
  updatedAt: string;
};
