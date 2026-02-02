import {prisma} from '../prisma';
import { PackageInput } from '@/types/package';

export const packageService = {
  async create(data: PackageInput) {
    const input: any = {
      name: data.name,
      tier: data.tier,
      description: data.description,
      price: data.price,
      duration: data.duration,
      isActive: data.isActive,
      propertyLimit: data.propertyLimit,
      featuredLimit: data.featuredLimit,
      storageLimit: data.storageLimit,
      supportType: data.supportType,
    };
    
    if (data.features) {
      input.features = data.features;
    }
    
    return prisma.package.create({
      data: input,
    });
  },

  async getAll() {
    return prisma.package.findMany();
  },

  async getById(id: string) {
    return prisma.package.findUnique({
      where: { id },
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
};
