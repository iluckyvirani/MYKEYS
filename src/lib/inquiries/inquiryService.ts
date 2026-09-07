import { prisma } from '../prisma';
import { InquiryInput } from '@/types/inquiry';

export const inquiryService = {
  async create(data: InquiryInput & { propertyId: string; name: string; email: string; type: string }) {
    return prisma.inquiry.create({
      data: {
        message: data.message || '',
        type: data.type,
        name: data.name,
        email: data.email,
        propertyId: data.propertyId,
      },
    });
  },

  async getAll() {
    return prisma.inquiry.findMany({
      include: {
        property: true,
        user: true,
      },
    });
  },

  async getById(id: string) {
    return prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: true,
        user: true,
      },
    });
  },

  async update(id: string, data: Partial<InquiryInput>) {
    return prisma.inquiry.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.inquiry.delete({
      where: { id },
    });
  },
};
