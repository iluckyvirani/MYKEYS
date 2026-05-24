/**
 * Payment Error Definitions
 * Standardized error handling for payment operations
 */

export enum PaymentErrorCode {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  UNAUTHORIZED_PAYMENT = 'UNAUTHORIZED_PAYMENT',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  STRIPE_ERROR = 'STRIPE_ERROR',
  REFUND_NOT_ALLOWED = 'REFUND_NOT_ALLOWED',
  DUPLICATE_SUBSCRIPTION = 'DUPLICATE_SUBSCRIPTION',
  STATUS_TRANSITION_ERROR = 'STATUS_TRANSITION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class PaymentError extends Error {
  constructor(
    public code: PaymentErrorCode,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

/**
 * Payment error factory functions
 */
export const createPaymentError = {
  invalidAmount: (details?: any) =>
    new PaymentError(
      PaymentErrorCode.INVALID_AMOUNT,
      'Payment amount must be greater than 0 and not exceed maximum limit',
      400,
      details
    ),

  invalidPaymentMethod: (method: string) =>
    new PaymentError(
      PaymentErrorCode.INVALID_PAYMENT_METHOD,
      `Invalid payment method: ${method}`,
      400,
      { method }
    ),

  paymentNotFound: () =>
    new PaymentError(
      PaymentErrorCode.PAYMENT_NOT_FOUND,
      'Payment not found',
      404
    ),

  bookingNotFound: () =>
    new PaymentError(
      PaymentErrorCode.BOOKING_NOT_FOUND,
      'Booking not found',
      404
    ),

  packageNotFound: () =>
    new PaymentError(
      PaymentErrorCode.PACKAGE_NOT_FOUND,
      'Package not found',
      404
    ),

  insufficientBalance: (available: number, required: number) =>
    new PaymentError(
      PaymentErrorCode.INSUFFICIENT_BALANCE,
      `Insufficient balance. Available: £${available}, Required: £${required}`,
      400,
      { available, required }
    ),

  unauthorizedPayment: (userId: string) =>
    new PaymentError(
      PaymentErrorCode.UNAUTHORIZED_PAYMENT,
      'You do not have permission to access this payment',
      403,
      { userId }
    ),

  paymentAlreadyProcessed: (paymentId: string) =>
    new PaymentError(
      PaymentErrorCode.PAYMENT_ALREADY_PROCESSED,
      'This payment has already been processed',
      400,
      { paymentId }
    ),

  invalidSignature: () =>
    new PaymentError(
      PaymentErrorCode.INVALID_SIGNATURE,
      'Payment signature verification failed',
      400
    ),

  stripeError: (message: string, error?: any) =>
    new PaymentError(
      PaymentErrorCode.STRIPE_ERROR,
      `Stripe error: ${message}`,
      400,
      { originalError: error?.message }
    ),

  refundNotAllowed: (status: string) =>
    new PaymentError(
      PaymentErrorCode.REFUND_NOT_ALLOWED,
      `Cannot refund payment with status: ${status}. Only PAID payments can be refunded.`,
      400,
      { status }
    ),

  duplicateSubscription: (packageId: string) =>
    new PaymentError(
      PaymentErrorCode.DUPLICATE_SUBSCRIPTION,
      'You already have an active subscription for this package',
      400,
      { packageId }
    ),

  statusTransitionError: (currentStatus: string, newStatus: string) =>
    new PaymentError(
      PaymentErrorCode.STATUS_TRANSITION_ERROR,
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
      400,
      { currentStatus, newStatus }
    ),

  databaseError: (message: string) =>
    new PaymentError(
      PaymentErrorCode.DATABASE_ERROR,
      'Database operation failed',
      500,
      { message }
    ),

  unknownError: (message: string) =>
    new PaymentError(
      PaymentErrorCode.UNKNOWN_ERROR,
      message,
      500
    ),
};
