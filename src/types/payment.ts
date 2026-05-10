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
  currency?: string; // Default: INR
  paymentMethod: PaymentMethod;
}

/**
 * Request to initiate a payment for a package
 */
export interface InitiatePackagePaymentRequest {
  packageId: string;
  amount: number;
  currency?: string; // Default: INR
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
 * Request to verify Razorpay payment
 */
export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
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
  
  // Razorpay fields
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  
  // Relations
  bookingId: string | null;
  packageId: string | null;
  userId: string;
  
  // Metadata
  metadata: Record<string, any> | null;
  
  // Type inference
  paymentType: PaymentType;
  
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
    guestName: string;
    propertyTitle: string;
    totalAmount: number;
    checkInDate: string;
    checkOutDate: string;
  };
  package?: {
    id: string;
    name: string;
    price: number;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Razorpay order creation response
 */
export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
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

// ============= RAZORPAY TYPES =============

/**
 * Razorpay configuration
 */
export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

/**
 * Razorpay webhook payload
 */
export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        [key: string]: any;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        status: string;
        [key: string]: any;
      };
    };
    [key: string]: any;
  };
}
