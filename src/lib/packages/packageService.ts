import {prisma} from '../prisma';
import { PackageInput } from '@/types/package';

export const packageService = {
  async create(data: PackageInput) {
    return prisma.package.create({
      data: {
        ...data,
      },
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
