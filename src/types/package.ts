export type PackageInput = {
  name: string;
  tier: PackageTier;
  description?: string;
  price: number;
  duration: 'monthly' | 'yearly';
  isActive?: boolean;
  
  // Core Features
  propertyLimit?: number;
  featuredLimit?: number;
  storageLimit?: number;
  
  // Lead Features
  dailyLeadsLimit?: number;
  totalLeadsLimit?: number;
  
  // Badge & Support
  hasVerifiedBadge?: boolean;
  supportType?: string;
  supportLevel?: 'standard' | 'priority' | 'vip';
  
  // Additional Features
  features?: Record<string, any>[]; 
  featuresIncluded?: string[]; // API_ACCESS, CUSTOM_DOMAIN, etc
};

export type PackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';

export type OwnerPackageWithUsage = {
  id: string;
  packageId: string;
  ownerId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startDate: string;
  endDate: string;
  nextBilling?: string;
  
  // Usage
  propertiesUsed: number;
  propertiesLimit: number;
  
  featuredUsed: number;
  featuredLimit: number;
  
  storageUsed: number;
  storageLimit: number;
  
  leadsUsedToday: number;
  leadsUsedTotal: number;
  dailyLeadsLimit: number;
  totalLeadsLimit: number;
  
  verifiedBadgeActive: boolean;
  hasVerifiedBadge: boolean;
  
  // Package Details
  packageName: string;
  supportLevel: string;
  price: number;
  duration: string;
};

export type PackageFeature = 
  | 'API_ACCESS'
  | 'CUSTOM_DOMAIN'
  | 'ADVANCED_ANALYTICS'
  | 'BULK_UPLOAD'
  | 'PRIORITY_SUPPORT'
  | 'VERIFIED_BADGE'
  | 'FEATURED_LISTINGS'
  | 'LEAD_CAPTURE';

// Default package configurations
export const PACKAGE_CONFIGS = {
  BASIC: {
    name: 'Basic',
    tier: 'BASIC' as const,
    description: 'Perfect for getting started',
    price: 0,
    duration: 'monthly' as const,
    propertyLimit: 1,
    featuredLimit: 0,
    storageLimit: 5,
    dailyLeadsLimit: 2,
    totalLeadsLimit: 10,
    hasVerifiedBadge: false,
    supportLevel: 'standard' as const,
    featuresIncluded: [],
  },
  STANDARD: {
    name: 'Standard',
    tier: 'STANDARD' as const,
    description: 'For growing your business',
    price: 99,
    duration: 'monthly' as const,
    propertyLimit: 5,
    featuredLimit: 2,
    storageLimit: 50,
    dailyLeadsLimit: 10,
    totalLeadsLimit: 100,
    hasVerifiedBadge: true,
    supportLevel: 'priority' as const,
    featuresIncluded: [
      'ADVANCED_ANALYTICS',
      'BULK_UPLOAD',
      'PRIORITY_SUPPORT',
      'VERIFIED_BADGE',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    tier: 'PREMIUM' as const,
    description: 'For professionals',
    price: 299,
    duration: 'monthly' as const,
    propertyLimit: 20,
    featuredLimit: 10,
    storageLimit: 500,
    dailyLeadsLimit: 50,
    totalLeadsLimit: 500,
    hasVerifiedBadge: true,
    supportLevel: 'vip' as const,
    featuresIncluded: [
      'API_ACCESS',
      'CUSTOM_DOMAIN',
      'ADVANCED_ANALYTICS',
      'BULK_UPLOAD',
      'PRIORITY_SUPPORT',
      'VERIFIED_BADGE',
      'FEATURED_LISTINGS',
      'LEAD_CAPTURE',
    ],
  },
};