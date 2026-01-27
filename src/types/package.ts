export type PackageInput = {
  name: string;
  tier: PackageTier;
  description?: string;
  price: number;
  duration: 'monthly' | 'yearly';
  isActive?: boolean;
  propertyLimit?: number;
  featuredLimit?: number;
  storageLimit?: number;
  supportType?: string;
  features?: Record<string, any>[]; 
};

export type PackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';