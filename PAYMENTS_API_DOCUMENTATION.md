# Payments API Documentation

## Overview

Comprehensive payment system API for handling booking payments and owner package purchases with Razorpay integration, payment verification, and refund processing.

---

## Table of Contents

1. [Authentication](#authentication)
2. [General Payments API](#general-payments-api)
3. [Booking Payments](#booking-payments)
4. [Package Payments](#package-payments)
5. [Payment Status Codes](#payment-status-codes)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Authentication

All payment endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## General Payments API

### 1. Initiate Payment

**POST** `/api/payments`

Initiate a new payment for either a booking or package.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "INR",
  "paymentMethod": "CREDIT_CARD",
  "bookingId": "booking_123",
  "packageId": null,
  "metadata": {
    "customField": "customValue"
  }
}
```

**Request Fields:**
- `amount` (number, required): Payment amount in INR
- `currency` (string, optional): Currency code. Default: "INR"
- `paymentMethod` (enum, required): Payment method
  - `CREDIT_CARD`
  - `DEBIT_CARD`
  - `UPI`
  - `NET_BANKING`
  - `CASH`
  - `WALLET`
  - `BANK_TRANSFER`
- `bookingId` (string, optional): ID of booking to pay for
- `packageId` (string, optional): ID of package to purchase
- `metadata` (object, optional): Additional metadata

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment": {
      "id": "payment_456",
      "amount": 5000,
      "currency": "INR",
      "paymentMethod": "CREDIT_CARD",
      "status": "PENDING",
      "transactionId": null,
      "razorpayOrderId": "order_123456",
      "razorpayPaymentId": null,
      "razorpaySignature": null,
      "bookingId": "booking_123",
      "packageId": null,
      "userId": "user_123",
      "metadata": {},
      "paymentType": "BOOKING",
      "createdAt": "2026-02-11T10:00:00Z",
      "updatedAt": "2026-02-11T10:00:00Z"
    },
    "razorpayOrder": {
      "orderId": "order_123456",
      "amount": 500000,
      "currency": "INR"
    }
  }
}
```

---

### 2. Get All Payments

**GET** `/api/payments`

Retrieve all payments for the authenticated user with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by payment status
  - `PENDING`, `PAID`, `FAILED`, `REFUNDED`, `PARTIAL`
- `paymentMethod` (optional): Filter by payment method
- `bookingId` (optional): Filter by booking
- `packageId` (optional): Filter by package
- `fromDate` (optional): Filter from date (ISO format)
- `toDate` (optional): Filter to date (ISO format)
- `page` (optional): Page number. Default: 1
- `limit` (optional): Items per page. Default: 10
- `sortBy` (optional): Sort field
  - `createdAt`, `amount`, `status`. Default: "createdAt"
- `sortOrder` (optional): Sort order
  - `asc`, `desc`. Default: "desc"

**Example:**
```
GET /api/payments?status=PAID&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": "payment_456",
      "amount": 5000,
      "currency": "INR",
      "paymentMethod": "CREDIT_CARD",
      "status": "PAID",
      "transactionId": "txn_123",
      "razorpayOrderId": "order_123456",
      "razorpayPaymentId": "pay_123456",
      "razorpaySignature": "sig_123456",
      "bookingId": "booking_123",
      "packageId": null,
      "userId": "user_123",
      "metadata": {},
      "paymentType": "BOOKING",
      "createdAt": "2026-02-11T10:00:00Z",
      "updatedAt": "2026-02-11T10:05:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3. Get Single Payment

**GET** `/api/payments/:id`

Get a specific payment by ID with related data.

**Path Parameters:**
- `id` (string, required): Payment ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "id": "payment_456",
    "amount": 5000,
    "currency": "INR",
    "paymentMethod": "CREDIT_CARD",
    "status": "PAID",
    "transactionId": "txn_123",
    "razorpayOrderId": "order_123456",
    "razorpayPaymentId": "pay_123456",
    "razorpaySignature": "sig_123456",
    "bookingId": "booking_123",
    "packageId": null,
    "userId": "user_123",
    "metadata": {},
    "paymentType": "BOOKING",
    "createdAt": "2026-02-11T10:00:00Z",
    "updatedAt": "2026-02-11T10:05:00Z",
    "booking": {
      "id": "booking_123",
      "guestName": "John Doe",
      "propertyTitle": "Luxury Beach Villa",
      "totalAmount": 15000,
      "checkInDate": "2026-02-15",
      "checkOutDate": "2026-02-18"
    },
    "user": {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 4. Verify Payment

**POST** `/api/payments/:id/verify`

Verify a payment using Razorpay signature verification.

**Path Parameters:**
- `id` (string, required): Payment ID

**Request Body:**
```json
{
  "razorpayOrderId": "order_123456",
  "razorpayPaymentId": "pay_123456",
  "razorpaySignature": "sig_123456abc..."
}
```

**Request Fields:**
- `razorpayOrderId` (string, required): Razorpay order ID
- `razorpayPaymentId` (string, required): Razorpay payment ID
- `razorpaySignature` (string, required): Razorpay payment signature

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "success": true,
    "paymentId": "payment_456",
    "status": "PAID",
    "message": "Payment verified successfully"
  }
}
```

---

### 5. Process Refund

**POST** `/api/payments/:id/refund`

Process a refund for a paid payment.

**Path Parameters:**
- `id` (string, required): Payment ID

**Request Body:**
```json
{
  "reason": "Booking cancelled by guest",
  "amount": 5000
}
```

**Request Fields:**
- `reason` (string, required): Reason for refund
- `amount` (number, optional): Partial refund amount. If not provided, full refund is processed.

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "refund_123456",
    "paymentId": "payment_456",
    "amount": 5000,
    "status": "processed",
    "message": "Refund processed successfully"
  }
}
```

---

## Booking Payments

### 1. Get Booking Payments

**GET** `/api/bookings/:id/payments`

Get all payments for a specific booking.

**Path Parameters:**
- `id` (string, required): Booking ID

**Access Control:**
- Booking guest can view their own booking payments
- Property owner can view booking payments for their properties

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Booking payments retrieved successfully",
  "data": [
    {
      "id": "payment_456",
      "amount": 5000,
      "currency": "INR",
      "paymentMethod": "CREDIT_CARD",
      "status": "PAID",
      "transactionId": "txn_123",
      "razorpayOrderId": "order_123456",
      "razorpayPaymentId": "pay_123456",
      "razorpaySignature": "sig_123456",
      "bookingId": "booking_123",
      "packageId": null,
      "userId": "user_123",
      "metadata": {},
      "paymentType": "BOOKING",
      "createdAt": "2026-02-11T10:00:00Z",
      "updatedAt": "2026-02-11T10:05:00Z"
    }
  ]
}
```

---

### 2. Create Booking Payment

**POST** `/api/bookings/:id/payments`

Initiate a payment for a booking.

**Path Parameters:**
- `id` (string, required): Booking ID

**Request Body:**
```json
{
  "amount": 5000,
  "paymentMethod": "CREDIT_CARD",
  "currency": "INR"
}
```

**Request Fields:**
- `amount` (number, required): Payment amount in INR
- `paymentMethod` (enum, required): Payment method
- `currency` (string, optional): Currency code. Default: "INR"

**Validation Rules:**
- Only booking guest can pay
- Payment amount cannot exceed remaining balance
- Remaining balance = bookingTotalAmount - paidAmount

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Booking payment initiated successfully",
  "data": {
    "payment": {
      "id": "payment_456",
      "amount": 5000,
      "currency": "INR",
      "paymentMethod": "CREDIT_CARD",
      "status": "PENDING",
      "transactionId": null,
      "razorpayOrderId": "order_123456",
      "razorpayPaymentId": null,
      "razorpaySignature": null,
      "bookingId": "booking_123",
      "packageId": null,
      "userId": "user_123",
      "metadata": {
        "bookingId": "booking_123",
        "totalBookingAmount": 15000,
        "remainingBalance": 10000
      },
      "paymentType": "BOOKING",
      "createdAt": "2026-02-11T10:00:00Z",
      "updatedAt": "2026-02-11T10:00:00Z"
    },
    "razorpayOrder": {
      "orderId": "order_123456",
      "amount": 500000,
      "currency": "INR"
    },
    "booking": {
      "id": "booking_123",
      "totalAmount": 15000,
      "paidAmount": 5000,
      "remainingBalance": 10000
    }
  }
}
```

---

## Package Payments

### 1. Get Package Payments

**GET** `/api/packages/:id/payments`

Get all payments for a specific package.

**Path Parameters:**
- `id` (string, required): Package ID

**Access Control:**
- Only package owner (owner who created/owns the package) can view payments

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Package payments retrieved successfully",
  "data": [
    {
      "id": "payment_789",
      "amount": 4999,
      "currency": "INR",
      "paymentMethod": "UPI",
      "status": "PAID",
      "transactionId": "txn_456",
      "razorpayOrderId": "order_789012",
      "razorpayPaymentId": "pay_789012",
      "razorpaySignature": "sig_789012",
      "bookingId": null,
      "packageId": "package_123",
      "userId": "owner_456",
      "metadata": {
        "packageId": "package_123",
        "packageName": "Premium Package",
        "packageTier": "PREMIUM",
        "listingCredits": 50,
        "duration": 30
      },
      "paymentType": "PACKAGE",
      "createdAt": "2026-02-10T08:00:00Z",
      "updatedAt": "2026-02-10T08:05:00Z",
      "user": {
        "id": "owner_456",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

### 2. Create Package Payment

**POST** `/api/packages/:id/payments`

Initiate a payment for a package (owner purchase/subscription).

**Path Parameters:**
- `id` (string, required): Package ID

**Request Body:**
```json
{
  "amount": 4999,
  "paymentMethod": "UPI",
  "currency": "INR"
}
```

**Request Fields:**
- `amount` (number, required): Payment amount must match package price
- `paymentMethod` (enum, required): Payment method
- `currency` (string, optional): Currency code. Default: "INR"

**Validation Rules:**
- Only owner who owns the package can pay
- Payment amount must exactly match package price
- Cannot create payment if already have active (PAID) subscription
- Cannot pay for packages owned by other users

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Package payment initiated successfully",
  "data": {
    "payment": {
      "id": "payment_789",
      "amount": 4999,
      "currency": "INR",
      "paymentMethod": "UPI",
      "status": "PENDING",
      "transactionId": null,
      "razorpayOrderId": "order_789012",
      "razorpayPaymentId": null,
      "razorpaySignature": null,
      "bookingId": null,
      "packageId": "package_123",
      "userId": "owner_456",
      "metadata": {
        "packageId": "package_123",
        "packageName": "Premium Package",
        "packageTier": "PREMIUM",
        "listingCredits": 50,
        "duration": 30
      },
      "paymentType": "PACKAGE",
      "createdAt": "2026-02-11T10:00:00Z",
      "updatedAt": "2026-02-11T10:00:00Z"
    },
    "razorpayOrder": {
      "orderId": "order_789012",
      "amount": 499900,
      "currency": "INR"
    },
    "package": {
      "id": "package_123",
      "name": "Premium Package",
      "price": 4999,
      "tier": "PREMIUM",
      "listingCredits": 50,
      "duration": 30
    }
  }
}
```

---

## Payment Status Codes

| Status | Description |
|--------|-------------|
| `PENDING` | Payment initiated but not yet verified |
| `PAID` | Payment verified and completed |
| `FAILED` | Payment failed during verification |
| `REFUNDED` | Payment was refunded to customer |
| `PARTIAL` | Partial payment received (for multi-part payments) |

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Missing or invalid input parameters |
| `VALIDATION_ERROR` | 400 | Validation error (e.g., amount exceeds balance) |
| `RESOURCE_NOT_FOUND` | 404 | Resource (booking/package/payment) not found |
| `UNAUTHORIZED` | 403 | User not authorized to perform action |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |

---

## Examples

### Example 1: Pay for a Booking

```bash
# Step 1: Initiate payment
curl -X POST http://localhost:3000/api/bookings/booking_123/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "paymentMethod": "UPI"
  }'

# Response includes razorpayOrder with orderId for frontend Razorpay integration

# Step 2: After user pays on frontend, frontend calls verify endpoint
curl -X POST http://localhost:3000/api/payments/payment_456/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_123456",
    "razorpayPaymentId": "pay_123456",
    "razorpaySignature": "sig_123456..."
  }'
```

### Example 2: Check Booking for Payment Status

```bash
# Get all bookings
curl -X GET "http://localhost:3000/api/bookings?page=1&limit=10" \
  -H "Authorization: Bearer <token>"

# Response will show paymentStatus: PAID, PENDING, etc.
# Check booking.balanceAmount to determine if more payment needed
```

### Example 3: Owner Purchases Package

```bash
# Step 1: Initiate package payment
curl -X POST http://localhost:3000/api/packages/package_123/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4999,
    "paymentMethod": "UPI"
  }'

# Step 2: Verify after payment
curl -X POST http://localhost:3000/api/payments/payment_789/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_789012",
    "razorpayPaymentId": "pay_789012",
    "razorpaySignature": "sig_789012..."
  }'

# Package owner now has active subscription with listing credits
```

### Example 4: Process Refund

```bash
curl -X POST http://localhost:3000/api/payments/payment_456/refund \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Booking cancelled by guest - no fee",
    "amount": 5000
  }'
```

---

## Integration Notes

### Frontend Integration Flow

1. **Initiate Payment** → Call `POST /api/bookings/:id/payments` or `POST /api/packages/:id/payments`
2. **Get Razorpay Order** → Receive `razorpayOrder.orderId` from response
3. **Open Razorpay Modal** → Use orderId with Razorpay JavaScript SDK
4. **Handle Payment Result** → On success, user receives payment details
5. **Verify Payment** → Call `POST /api/payments/:id/verify` with Razorpay signature
6. **Confirm Success** → Payment status updated to `PAID`

### Environment Variables Required

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## Related Documentation

- [REVIEWS_API_DOCUMENTATION.md](./REVIEWS_API_DOCUMENTATION.md)
- [BOOKINGS_API_DOCUMENTATION.md](./BOOKINGS_API_DOCUMENTATION.md) (if available)
- [Razorpay Documentation](https://razorpay.com/docs/)
