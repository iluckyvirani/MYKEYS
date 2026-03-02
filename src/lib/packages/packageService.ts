import {prisma} from '../prisma';
import { PackageInput, PACKAGE_CONFIGS, PackageTier } from '@/types/package';

export const packageService = {
  // Package Management
  async create(data: PackageInput) {
    const input: any = {
      name: data.name,
      tier: data.tier,
      description: data.description,
      price: data.price,
      duration: data.duration,
      isActive: data.isActive ?? true,
      propertyLimit: data.propertyLimit ?? 1,
      featuredLimit: data.featuredLimit ?? 0,
      storageLimit: data.storageLimit ?? 5,
      dailyLeadsLimit: data.dailyLeadsLimit ?? 2,
      totalLeadsLimit: data.totalLeadsLimit ?? 10,
      hasVerifiedBadge: data.hasVerifiedBadge ?? false,
      supportType: data.supportType ?? 'email',
      supportLevel: data.supportLevel ?? 'standard',
      featuresIncluded: data.featuresIncluded ?? [],
    };
    
    if (data.features) {
      input.features = data.features;
    }
    
    return prisma.package.create({
      data: input,
    });
  },

  async getAll() {
    return prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
  },

  async getById(id: string) {
    return prisma.package.findUnique({
      where: { id },
    });
  },

  async getByTier(tier: PackageTier) {
    return prisma.package.findFirst({
      where: { tier, isActive: true },
    });
  },

  async update(id: string, data: Partial<PackageInput>) {
    return prisma.package.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.package.delete({
      where: { id },
    });
  },

  // Initialize default packages
  async initializeDefaultPackages() {
    for (const [_, config] of Object.entries(PACKAGE_CONFIGS)) {
      const existing = await prisma.package.findFirst({
        where: { tier: config.tier }
      });
      
      if (!existing) {
        await this.create(config as PackageInput);
      }
    }
  },

  // Owner Package Management
  async subscribeOwner(ownerId: string, packageId: string, duration: 'monthly' | 'yearly') {
    // End previous active subscription
    await prisma.ownerPackage.updateMany({
      where: {
        ownerId,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    if (duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return prisma.ownerPackage.create({
      data: {
        packageId,
        ownerId,
        status: 'ACTIVE',
        startDate,
        endDate,
        nextBilling: endDate,
      },
      include: {
        package: true,
      }
    });
  },

  async getOwnerActivePackage(ownerId: string) {
    return prisma.ownerPackage.findFirst({
      where: {
        ownerId,
        status: 'ACTIVE',
        endDate: {
          gt: new Date()
        }
      },
      include: {
        package: true,
      }
    });
  },

  async getOwnerPackageUsage(ownerId: string) {
    const ownerPackage = await this.getOwnerActivePackage(ownerId);
    
    if (!ownerPackage) {
      return null;
    }

    const pkg = ownerPackage.package;
    
    return {
      id: ownerPackage.id,
      packageId: pkg.id,
      packageName: pkg.name,
      tier: pkg.tier,
      status: ownerPackage.status,
      startDate: ownerPackage.startDate.toISOString(),
      endDate: ownerPackage.endDate.toISOString(),
      
      // Property Usage
      propertiesUsed: ownerPackage.propertiesUsed,
      propertiesLimit: pkg.propertyLimit,
      propertiesRemaining: pkg.propertyLimit - ownerPackage.propertiesUsed,
      
      // Featured Usage
      featuredUsed: ownerPackage.featuredUsed,
      featuredLimit: pkg.featuredLimit,
      featuredRemaining: pkg.featuredLimit - ownerPackage.featuredUsed,
      
      // Storage Usage
      storageUsed: ownerPackage.storageUsed,
      storageLimit: pkg.storageLimit,
      storageRemaining: pkg.storageLimit - ownerPackage.storageUsed,
      storagePercentage: (ownerPackage.storageUsed / pkg.storageLimit) * 100,
      
      // Leads Usage
      leadsUsedToday: ownerPackage.leadsUsedToday,
      leadsUsedTotal: ownerPackage.leadsUsedTotal,
      dailyLeadsLimit: pkg.dailyLeadsLimit,
      totalLeadsLimit: pkg.totalLeadsLimit,
      leadsRemaining: pkg.totalLeadsLimit - ownerPackage.leadsUsedTotal,
      leadsRemainingToday: pkg.dailyLeadsLimit - ownerPackage.leadsUsedToday,
      
      // Features
      hasVerifiedBadge: pkg.hasVerifiedBadge,
      verifiedBadgeActive: ownerPackage.verifiedBadgeActive,
      supportLevel: pkg.supportLevel,
      featuresIncluded: pkg.featuresIncluded,
      
      // Pricing
      price: pkg.price,
      duration: pkg.duration,
    };
  },

  // Usage tracking
  async incrementPropertyUsage(ownerId: string, count: number = 1) {
    return prisma.ownerPackage.updateMany({
      where: {
        ownerId,
        status: 'ACTIVE'
      },
      data: {
        propertiesUsed: {
          increment: count
        }
      }
    });
  },

  async incrementFeaturedUsage(ownerId: string, count: number = 1) {
    return prisma.ownerPackage.updateMany({
      where: {
        ownerId,
        status: 'ACTIVE'
      },
      data: {
        featuredUsed: {
          increment: count
        }
      }
    });
  },

  async updateStorageUsage(ownerId: string, storageUsed: number) {
    return prisma.ownerPackage.updateMany({
      where: {
        ownerId,
        status: 'ACTIVE'
      },
      data: {
        storageUsed
      }
    });
  },

  async incrementLeadsUsage(ownerId: string) {
    return prisma.ownerPackage.updateMany({
      where: {
        ownerId,
        status: 'ACTIVE'
      },
      data: {
        leadsUsedToday: {
          increment: 1
        },
        leadsUsedTotal: {
          increment: 1
        }
      }
    });
  },

  async resetDailyLeads() {
    // Reset daily leads at midnight for all active subscriptions
    return prisma.ownerPackage.updateMany({
      where: {
        status: 'ACTIVE'
      },
      data: {
        leadsUsedToday: 0
      }
    });
  },

  async activateVerifiedBadge(ownerId: string) {
    return prisma.ownerPackage.updateMany({
      where: {
        ownerId,
        status: 'ACTIVE',
        package: {
          hasVerifiedBadge: true
        }
      },
      data: {
        verifiedBadgeActive: true
      }
    });
  },

  async deactivateVerifiedBadge(ownerId: string) {
    return prisma.ownerPackage.updateMany({
      where: {
        ownerId,
        status: 'ACTIVE'
      },
      data: {
        verifiedBadgeActive: false
      }
    });
  },

  // Upgrade check
  async canUpgradePackage(ownerId: string) {
    const currentPackage = await this.getOwnerActivePackage(ownerId);
    if (!currentPackage) return true;

    const allPackages = await this.getAll();
    const tierOrder = ['BASIC', 'STANDARD', 'PREMIUM'];
    const currentTierIndex = tierOrder.indexOf(currentPackage.package.tier);
    
    return currentTierIndex < tierOrder.length - 1;
  },

  async getUpgradeOptions(ownerId: string) {
    const currentPackage = await this.getOwnerActivePackage(ownerId);
    const allPackages = await this.getAll();
    
    if (!currentPackage) {
      return allPackages;
    }

    const tierOrder = ['BASIC', 'STANDARD', 'PREMIUM'];
    const currentTierIndex = tierOrder.indexOf(currentPackage.package.tier);
    
    return allPackages.filter(pkg => {
      const pkgTierIndex = tierOrder.indexOf(pkg.tier);
      return pkgTierIndex > currentTierIndex;
    });
  }
};
