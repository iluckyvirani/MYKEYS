import { prisma } from '../prisma';
import { BookingInput } from '@/types/bookings';

export const bookingService = {
  async create(data: BookingInput) {
    return prisma.booking.create({
      data: {
        ...data,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        balanceAmount: data.totalAmount - (data.paidAmount || 0),
      },
    });
  },

  async getAll() {
    return prisma.booking.findMany({
      include: {
        guest: true,
        owner: true,
        property: true,
        payment: true,
        review: true,
      },
    });
  },

  async getById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        owner: true,
        property: true,
        payment: true,
        review: true,
      },
    });
  },

  async update(id: string, data: Partial<BookingInput>) {
    return prisma.booking.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.booking.delete({
      where: { id },
    });
  },
};
