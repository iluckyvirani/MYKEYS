import { prisma } from '../prisma';
import { BookingInput } from '@/types/bookings';

export const bookingService = {
  async create(data: BookingInput) {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return prisma.booking.create({
      data: {
        ...data,
        checkIn,
        checkOut,
        nights,
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
