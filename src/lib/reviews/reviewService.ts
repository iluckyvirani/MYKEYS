import {prisma} from '../prisma';
import { ReviewInput } from '@/types/review';

export const reviewService = {
  async create(data: ReviewInput) {
    // validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return prisma.review.create({
      data,
    });
  },

  async getAll() {
    return prisma.review.findMany({
      include: {
        property: true,
        user: true,
        booking: true,
      },
    });
  },

  async getById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        property: true,
        user: true,
        booking: true,
      },
    });
  },

  async update(id: string, data: Partial<ReviewInput>) {
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    return prisma.review.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  },
};
