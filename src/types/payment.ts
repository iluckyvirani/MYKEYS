/**
 * Payment Types and Interfaces
 * Handles payment operations for bookings and packages
 */

import { PaymentStatus, PaymentMethod } from '@prisma/client';

// ============= ENUMS (for reference - defined in Prisma) =============

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL = 'PARTIAL',
}

export enum PaymentMethodEnum {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING',
  CASH = 'CASH',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentType {
  BOOKING = 'BOOKING',
  PACKAGE = 'PACKAGE',
}

// ============= INPUT TYPES =============

/**
 * Request to initiate a payment for a booking
 */
export interface InitiateBookingPaymentRequest {
  bookingId: string;
  amount: number;
  currency?: string; // Default: GBP
  paymentMethod: PaymentMethod;
}

/**
 * Request to initiate a payment for a package
 */
export interface InitiatePackagePaymentRequest {
  packageId: string;
  amount: number;
  currency?: string; // Default: GBP
  paymentMethod: PaymentMethod;
}

/**
 * Generic payment initiation request
 */
export interface InitiatePaymentRequest {
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  bookingId?: string;
  packageId?: string;
  metadata?: Record<string, any>;
}

/**
 * Request to confirm a Stripe payment (after client-side confirmPayment)
 */
export interface ConfirmPaymentRequest {
  stripePaymentIntentId?: string;
}

/**
 * Request to process refund
 */
export interface ProcessRefundRequest {
  paymentId: string;
  reason: string;
  amount?: number; // Partial refund amount if not specified, full refund
}

// ============= DTO TYPES =============

/**
 * Payment Data Transfer Object
 * Returned in API responses
 */
export interface PaymentDTO {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;

  // Stripe fields
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;

  // Commission fields
  commissionPercent: number | null;
  commissionAmount: number | null;
  ownerEarnings: number | null;

  // Relations
  bookingId: string | null;
  packageId: string | null;
  userId: string;

  // Metadata
  metadata: Record<string, any> | null;

  // Type inference
  paymentType: PaymentType;

  // Expanded relation data (present when fetched with include)
  booking?: {
    id: string;
    checkIn: string;
    checkOut: string;
    property?: { id: string; title: string; city: string; state: string } | null;
    guest?: { id: string; firstName: string; lastName: string; email: string } | null;
  } | null;
  package?: {
    id: string;
    name: string | null;
  } | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended payment info with related data
 */
export interface PaymentDetailDTO extends PaymentDTO {
  booking?: {
    id: string;
    checkIn: string;
    checkOut: string;
    guestName?: string;
    propertyTitle?: string;
    totalAmount?: number;
    checkInDate?: string;
    checkOutDate?: string;
    property?: { id: string; title: string; city: string; state: string } | null;
    guest?: { id: string; firstName: string; lastName: string; email: string } | null;
  } | null;
  package?: {
    id: string;
    name: string | null;
    price?: number;
  } | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Stripe PaymentIntent creation response
 */
export interface StripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  message: string;
}

/**
 * Refund response
 */
export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  status: string;
  message: string;
}

// ============= FILTER TYPES =============

/**
 * Filter options for fetching payments
 */
export interface PaymentFilter {
  userId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  bookingId?: string;
  packageId?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated payment list response
 */
export interface PaymentListResponse {
  payments: PaymentDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============= STRIPE TYPES =============

/**
 * Stripe configuration (publishable key exposed to the client)
 */
export interface StripeConfig {
  publishableKey: string;
}
