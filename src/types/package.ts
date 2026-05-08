// Phase 1: Fully dynamic packages — no fixed tiers
export type DurationUnit = 'days' | 'months' | 'years';

export type PackageInput = {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  durationValue: number;  // e.g. 10, 1, 6
  durationUnit: DurationUnit; // "days" | "months" | "years"
  isActive?: boolean;

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

  // Feature flags
  showOwnerName: boolean;
  showOwnerPhone: boolean;
  directInquiryToOwner: boolean;
  adminCCOnInquiry: boolean;
  fullAdminSupport: boolean;
  docExpiryAlert: boolean;
};

export type AdminSettings = {
  id: string;
  shortRentCommissionPercent: number;
  updatedAt: string;
};