/**
 * Payment Validation Utilities
 * Provides validation helpers for payment operations
 */

import { PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): boolean {
  if (!amount || amount <= 0) {
    return false;
  }
  // Maximum amount: 50 lakhs (5000000)
  if (amount > 5000000) {
    return false;
  }
  return true;
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(method: string): method is PaymentMethod {
  const validMethods = [
    'CREDIT_CARD',
    'DEBIT_CARD',
    'UPI',
    'NET_BANKING',
    'CASH',
    'WALLET',
    'BANK_TRANSFER',
  ];
  return validMethods.includes(method);
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): boolean {
  const validCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
  return validCurrencies.includes(currency.toUpperCase());
}

/**
 * Convert amount to paise (smallest unit in Indian currency)
 */
export function amountToPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert paise to amount
 */
export function paiseToAmount(paise: number): number {
  return Math.round(paise / 100);
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Validate Razorpay signature
 */
export function validateRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Generate unique receipt ID
 */
export function generateReceiptId(bookingId?: string, packageId?: string): string {
  const id = bookingId || packageId || 'payment';
  const timestamp = Date.now();
  return `${id}-${timestamp}`;
}

/**
 * Payment status transitions
 */
export function isValidStatusTransition(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus
): boolean {
  const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
    ],
    [PaymentStatus.PAID]: [
      PaymentStatus.REFUNDED,
      PaymentStatus.PARTIAL,
    ],
    [PaymentStatus.FAILED]: [
      PaymentStatus.PENDING, // Retry
    ],
    [PaymentStatus.REFUNDED]: [], // Terminal
    [PaymentStatus.PARTIAL]: [
      PaymentStatus.PAID,
      PaymentStatus.REFUNDED,
    ],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Validate payment metadata
 */
export function validatePaymentMetadata(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') {
    return true; // Optional
  }

  // Check size (max 1KB)
  const size = JSON.stringify(metadata).length;
  return size <= 1024;
}

/**
 * Extract payment details from request
 */
export function extractPaymentDetails(body: any) {
  return {
    amount: body.amount ? parseFloat(body.amount) : null,
    paymentMethod: body.paymentMethod?.toUpperCase() || null,
    currency: body.currency?.toUpperCase() || 'INR',
    bookingId: body.bookingId || null,
    packageId: body.packageId || null,
    metadata: body.metadata || null,
  };
}
