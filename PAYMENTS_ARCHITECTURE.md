# Payment APIs - Architecture & Design Overview

## Summary

A complete payment system implementation following your existing API design patterns. Handles booking payments and owner package purchases with Razorpay integration.

---

## Architecture Overview

### Design Pattern: Service-Repository Pattern

Following the same pattern as your `reviewService`:

```
API Routes (route.ts)
    ↓
Service Layer (paymentService.ts)
    ↓
Database (Prisma ORM)
    ↓
External Service (Razorpay)
```

---

## File Structure

```
src/
├── types/
│   └── payment.ts                    # Payment types & interfaces
├── lib/
│   └── payments/
│       └── paymentService.ts         # Business logic & Razorpay integration
└── app/api/
    ├── payments/
    │   ├── route.ts                  # GET /api/payments, POST /api/payments
    │   └── [id]/
    │       ├── route.ts              # GET /api/payments/:id
    │       ├── verify/
    │       │   └── route.ts          # POST /api/payments/:id/verify
    │       └── refund/
    │           └── route.ts          # POST /api/payments/:id/refund
    ├── bookings/[id]/
    │   └── payments/
    │       └── route.ts              # Booking-specific payment endpoints
    └── packages/[id]/
        └── payments/
            └── route.ts              # Package-specific payment endpoints
```

---

## API Endpoints

### General Payments API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments` | Initiate a new payment |
| `GET` | `/api/payments` | Get all user payments (with filters) |
| `GET` | `/api/payments/:id` | Get specific payment details |
| `POST` | `/api/payments/:id/verify` | Verify payment with Razorpay signature |
| `POST` | `/api/payments/:id/refund` | Process refund |

### Booking-Specific Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings/:id/payments` | Initiate booking payment |
| `GET` | `/api/bookings/:id/payments` | Get booking payments |

### Package-Specific Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/packages/:id/payments` | Initiate package payment |
| `GET` | `/api/packages/:id/payments` | Get package payments (owner only) |

---

## Key Features

### 1. **Razorpay Integration**
- Order creation with automatic amount conversion to paise
- Signature verification using HMAC-SHA256
- Webhook support ready (extensible)
- Transaction ID tracking

### 2. **Flexible Payment Support**
- Multiple payment methods (Credit Card, Debit Card, UPI, Net Banking, etc.)
- Multi-currency support (default: INR)
- Partial refunds supported
- Metadata storage for extensibility

### 3. **Business Logic Validation**
```typescript
// Booking Payments:
- Only guest can pay for their booking
- Payment amount cannot exceed remaining balance
- Automatic balance calculation

// Package Payments:
- Only owner can purchase their own packages
- Amount must match package price exactly
- Prevents duplicate active subscriptions
```

### 4. **Payment Tracking**
- Complete payment history per user
- Payment summary statistics
- Filter by status, method, date range
- Pagination support
- Sortable by creation date, amount, or status

### 5. **Authentication & Authorization**
- Uses existing `withAuth` middleware
- JWT-based authentication
- Role-based access control:
  - Users can only access their own payments
  - Owners can only manage their own packages
  - Guests can only pay for their bookings

### 6. **Response Consistency**
All responses follow your standard format:
```typescript
{
  success: boolean
  message: string
  data?: T
  code?: string
  errors?: Record<string, string[]>
}
```

---

## Service Methods

### `paymentService` Core Methods

```typescript
// Initiate payment - creates Razorpay order & payment record
initiatePayment(data: InitiatePaymentRequest, userId: string)

// Verify payment - validates Razorpay signature & updates status
verifyPayment(paymentId: string, data: VerifyPaymentRequest, userId: string)

// Process refund - handles Razorpay refund API
processRefund(paymentId: string, refundData: ProcessRefundRequest, userId: string)

// Get all payments with filtering & pagination
getPayments(filters: PaymentFilter)

// Get single payment with related data
getPaymentById(paymentId: string, userId: string)

// Get payment by Razorpay Order ID
getPaymentByOrderId(orderId: string)

// Get user payment summary
getUserPaymentSummary(userId: string)
```

---

## Data Types

### Payment DTO (Data Transfer Object)
```typescript
{
  id: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  transactionId: string | null
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  razorpaySignature: string | null
  bookingId: string | null
  packageId: string | null
  userId: string
  metadata: Record<string, any> | null
  paymentType: 'BOOKING' | 'PACKAGE'
  createdAt: string
  updatedAt: string
}
```

### Payment Status Enum
```typescript
PENDING  // Payment initiated, awaiting verification
PAID     // Payment verified and completed
FAILED   // Payment verification failed
REFUNDED // Payment was refunded
PARTIAL  // Partial payment received (for future use)
```

### Payment Methods
```
CREDIT_CARD
DEBIT_CARD
UPI
NET_BANKING
CASH
WALLET
BANK_TRANSFER
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

**Standard HTTP Status Codes:**
- `400`: Bad request (validation error)
- `401`: Unauthorized (missing JWT)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Internal server error

---

## Security Considerations

1. **Signature Verification**: All Razorpay payments verified with HMAC-SHA256
2. **User Isolation**: Users can only access their own payments
3. **Amount Validation**: Payment amounts validated against business rules
4. **Authorization Checks**: Explicit permission checks on sensitive operations
5. **Metadata Encryption**: Sensitive data can be added to payment metadata securely
6. **API Keys**: Uses environment variables for Razorpay credentials

---

## Environment Setup Required

```bash
# .env.local
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

## Frontend Integration Example

```javascript
// Step 1: Initiate payment
const response = await fetch('/api/bookings/booking_123/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 10000,
    paymentMethod: 'UPI'
  })
});

const { data } = await response.json();
const orderId = data.razorpayOrder.orderId;

// Step 2: Open Razorpay Modal
const options = {
  key: 'RAZORPAY_KEY_ID',
  amount: data.razorpayOrder.amount,
  currency: 'INR',
  order_id: orderId,
  handler(response) {
    // Step 3: Verify payment
    fetch(`/api/payments/${data.payment.id}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      })
    });
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

---

## Testing Endpoints with cURL

### 1. Initiate Booking Payment
```bash
curl -X POST http://localhost:3000/api/bookings/booking_123/payments \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentMethod": "UPI"
  }'
```

### 2. Get All User Payments
```bash
curl -X GET "http://localhost:3000/api/payments?status=PAID&page=1" \
  -H "Authorization: Bearer eyJhbGc..."
```

### 3. Get Single Payment Details
```bash
curl -X GET http://localhost:3000/api/payments/payment_456 \
  -H "Authorization: Bearer eyJhbGc..."
```

### 4. Verify Payment
```bash
curl -X POST http://localhost:3000/api/payments/payment_456/verify \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_123456",
    "razorpayPaymentId": "pay_123456",
    "razorpaySignature": "sig_abc123..."
  }'
```

### 5. Process Refund
```bash
curl -X POST http://localhost:3000/api/payments/payment_456/refund \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Booking cancelled",
    "amount": 5000
  }'
```

---

## Next Steps & Enhancements

1. **Webhook Handler**: Create `/api/webhooks/razorpay` to handle Razorpay events
2. **Notification System**: Integrate with existing notifications API
3. **Invoice Generation**: Create invoice service for payment records
4. **Analytics Dashboard**: Add payment analytics endpoints for owners
5. **Payment Plans**: Support installment/EMI options
6. **Dispute Handling**: Add dispute resolution workflow
7. **Tax Calculation**: Integrate tax calculation based on payment type

---

## Related Files

- [src/types/payment.ts](./src/types/payment.ts) - Type definitions
- [src/lib/payments/paymentService.ts](./src/lib/payments/paymentService.ts) - Business logic
- [PAYMENTS_API_DOCUMENTATION.md](./PAYMENTS_API_DOCUMENTATION.md) - Full API reference
- [prisma/schema.prisma](./prisma/schema.prisma) - Database schema with Payment model

---

## Questions or Issues?

Refer to the comprehensive documentation in `PAYMENTS_API_DOCUMENTATION.md` or check existing API implementations for pattern references.
