export type BookingInput = {
  checkIn: string | Date;
  checkOut: string | Date;
  nights: number;
  guests?: number;
  children?: number;
  pets?: number;
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  totalAmount: number;
  paidAmount?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  specialRequests?: string;
  notes?: string;
  propertyId: string;
  guestId: string;
  ownerId: string;
};

// Enums matching your Prisma schema
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'RENTED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'CASH' | 'OTHER';
