import { prisma } from '../prisma';
import { InquiryInput } from '@/types/inquiry';

export const inquiryService = {
  async create(data: InquiryInput) {
    return prisma.inquiry.create({
      data,
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
