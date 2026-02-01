/**
 * Booking Types and Enums
 * Supports multiple booking types: SHORT_TERM (nightly rental)
 */

// ============= ENUMS =============

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
}

export enum BookingType {
  SHORT_TERM = 'SHORT_TERM',
  LONG_TERM = 'LONG_TERM',
}

// ============= DTO TYPES =============

/**
 * ShortBookingDTO - Data Transfer Object for short-term bookings
 * Represents a nightly rental booking
 */
export interface ShortBookingDTO {
  // Identifiers
  id: string;
  bookingType: BookingType.SHORT_TERM;
  propertyId: string;
  propertyTitle: string;

  // Guest Information
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;

  // Date Information
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfNights: number;

  // Guest Details
  numberOfGuests: number;

  // Pricing Breakdown
  pricePerNight: number;
  totalNights: number;
  subtotal: number; // pricePerNight * numberOfNights
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;

  // Payment Information
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount: number;
  balanceAmount: number;

  // Booking Status
  status: BookingStatus;
  specialRequests?: string;

  // Owner Information
  ownerId: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============= REQUEST/RESPONSE TYPES =============

/**
 * Request to create a short-term booking
 */
export interface CreateShortBookingRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  paymentMethod?: PaymentMethod;
  specialRequests?: string;
}

/**
 * Request to update booking status
 */
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  notes?: string;
}

/**
 * Single booking response
 */
export interface BookingResponse {
  success: boolean;
  message: string;
  data: ShortBookingDTO | null;
}

/**
 * Updated booking status response
 */
export interface UpdateBookingStatusResponse {
  success: boolean;
  message: string;
  data: ShortBookingDTO;
}

/**
 * Paginated booking list response
 */
export interface BookingListResponse {
  success: boolean;
  message: string;
  data: {
    items: ShortBookingDTO[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Query filters for fetching bookings
 */
export interface BookingFilters {
  propertyId?: string;
  guestId?: string;
  ownerId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ============= LEGACY TYPE (for compatibility) =============

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
