# Payment APIs - Complete Integration Guide

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MYKEYS Platform                                  │
│                                                                       │
│  Frontend (Web/Mobile)                                              │
│  ├─ /signup, /login                                                 │
│  ├─ /dashboard                                                       │
│  ├─ /property/[id] (Property details + Booking)                     │
│  └─ /payment (Payment processing)                                    │
│                                                                       │
└───────────────────────┬──────────────────────────────────────────────┘
                        │
                        │ HTTPS/REST
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│                   API Routes (Next.js)                               │
│                                                                       │
│  Authentication Layer                                               │
│  ├─ JWT Verification (withAuth middleware)                          │
│  ├─ User Context Extraction                                         │
│  └─ Error Handling                                                   │
│                                                                       │
│  Endpoint Groups                                                    │
│  ├─ POST   /api/payments - Initiate payment                         │
│  ├─ GET    /api/payments - List payments                            │
│  ├─ GET    /api/payments/:id - Get payment details                  │
│  ├─ POST   /api/payments/:id/verify - Verify payment               │
│  ├─ POST   /api/payments/:id/refund - Process refund               │
│  ├─ POST   /api/bookings/:id/payments - Booking payment             │
│  ├─ GET    /api/bookings/:id/payments - List booking payments       │
│  ├─ POST   /api/packages/:id/payments - Package payment             │
│  └─ GET    /api/packages/:id/payments - List package payments       │
│                                                                       │
└───────────────────────┬──────────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────────────┐
│              Service Layer (paymentService)                          │
│                                                                       │
│  Core Operations                                                    │
│  ├─ initiatePayment()    [→ Create Razorpay order]                  │
│  ├─ verifyPayment()      [→ Validate signature]                     │
│  ├─ processRefund()      [→ Handle refunds]                         │
│  ├─ getPayments()        [→ List with filters]                      │
│  ├─ getPaymentById()     [→ Get details]                            │
│  └─ getUserPaymentSummary() [→ Statistics]                          │
│                                                                       │
│  Supporting Utilities                                               │
│  ├─ validation.ts        [→ Input validation]                       │
│  ├─ errors.ts            [→ Error definitions]                      │
│  └─ mapPaymentToDTO()    [→ Response formatting]                    │
│                                                                       │
└────────┬──────────────────┬──────────────────────────────┬───────────┘
         │                  │                              │
         │                  │                              │
    ┌────▼────┐      ┌──────▼────────┐          ┌─────────▼────────┐
    │Razorpay │      │  Prisma ORM   │          │  Validation      │
    │          │      │  (Database)   │          │  Utilities       │
    │  API     │      │               │          │                  │
    │          │      │  ┌─────────┐  │          │  ┌────────────┐  │
    │  Orders  │      │  │Payment  │  │          │  │ Amount     │  │
    │  Payments│      │  │  Table  │  │          │  │validation  │  │
    │  Refunds │      │  │         │  │          │  │            │  │
    │  Webhooks│      │  │Booking  │  │          │  │Method      │  │
    │          │      │  │User     │  │          │  │validation  │  │
    │          │      │  │Package  │  │          │  │            │  │
    │  Testing │      │  │         │  │          │  │Signature   │  │
    │  Mode    │      │  └─────────┘  │          │  │verification│  │
    │  Keys    │      │               │          │  │            │  │
    │          │      │               │          │  │Status      │  │
    │ Key ID:  │      │ PostgreSQL    │          │  │transition  │  │
    │rzp_test_ │      │               │          │  └────────────┘  │
    │1DP5M..   │      │               │          │                  │
    │          │      │               │          │  Types Library   │
    │Secret:   │      │               │          │  (payment.ts)   │
    │wnHf7..   │      │               │          │                  │
    │          │      │               │          │  ✅ DTOs        │
    └──────────┘      └───────────────┘          │  ✅ Enums       │
                                                  │  ✅ Filters     │
                                                  │  ✅ Requests    │
                                                  └──────────────────┘
```

---

## 🔄 Payment Flow Diagrams

### Complete Booking Payment Flow

```
User
  │
  ├─ Browse Properties
  │
  ├─ Select Dates & Create Booking
  │   └─ Store: bookingId, amount: 5000
  │
  ├─ Click "Pay Now" Button
  │   │
  │   └─ POST /api/bookings/:id/payments
  │       └─ Amount: 5000, Method: UPI
  │           │
  │           API Route (withAuth)
  │               │
  │               ├─ Verify user is guest
  │               ├─ Check booking exists
  │               ├─ Validate amount <= balance
  │               │
  │               paymentService.initiatePayment()
  │               │   ├─ Create Razorpay Order
  │               │   │   └─ Amount: 500000 paise
  │               │   │       Receipt: booking_id-timestamp
  │               │   │       Notes: {bookingId, userId}
  │               │   │
  │               │   └─ Create Payment Record
  │               │       ├─ status: PENDING
  │               │       ├─ razorpayOrderId
  │               │       └─ Store in Database
  │               │
  │               └─ Return:
  │                   ├─ payment: {...details}
  │                   └─ razorpayOrder: {orderId, amount}
  │
  ├─ Razorpay Modal Opens
  │   ├─ Amount: ₹5000
  │   ├─ Order ID displayed
  │   └─ User selects payment method
  │
  ├─ Enter Payment Details
  │   └─ UPI: success@razorpay
  │       (or test card: 4111111111111111)
  │
  ├─ Complete Payment
  │   └─ Get response:
  │       ├─ razorpay_order_id
  │       ├─ razorpay_payment_id
  │       └─ razorpay_signature
  │
  ├─ POST /api/payments/:id/verify
  │   │   Data:
  │   │   ├─ orderId
  │   │   ├─ paymentId
  │   │   └─ signature
  │   │
  │   API Route (withAuth)
  │   │   │
  │   │   paymentService.verifyPayment()
  │   │   │   ├─ Fetch payment from DB
  │   │   │   ├─ Verify user owns payment
  │   │   │   ├─ Validate signature
  │   │   │   │   └─ HMAC-SHA256 check
  │   │   │   │
  │   │   │   └─ Update Payment
  │   │   │       ├─ status: PAID
  │   │   │       ├─ razorpayPaymentId
  │   │   │       └─ transactionId
  │   │   │
  │   │   └─ Update Booking
  │   │       ├─ paymentStatus: PAID
  │   │       ├─ paidAmount: 5000
  │   │       └─ balanceAmount: 0
  │   │
  │   └─ Return: {success: true, status: PAID}
  │
  └─ Payment Complete!
      └─ Booking now PAID
          ├─ Can proceed with check-in
          ├─ Payment receipt available
          └─ Can view in payment history
```

### Refund Flow

```
User (who made payment)
  │
  ├─ View Payment
  │
  ├─ Request Refund
  │   └─ Reason: "Booking cancelled"
  │
  └─ POST /api/payments/:id/refund
      │
      API Route
      │
      paymentService.processRefund()
      │
      ├─ Fetch payment (status: PAID)
      ├─ Verify user owns payment
      ├─ Verify Razorpay Payment ID exists
      │
      ├─ Call Razorpay API
      │   └─ refund amount: 500000 paise
      │
      ├─ Update Payment in DB
      │   ├─ status: REFUNDED
      │   └─ metadata: {refundId, reason, amount}
      │
      ├─ Update Booking
      │   ├─ paymentStatus: REFUNDED
      │   └─ paidAmount: 0
      │
      └─ Return: {success: true, refundId, status: issued}
          │
          └─ Razorpay processes refund
              └─ Money back to user account
```

---

## 📋 API Request/Response Examples

### Example 1: Initiate Booking Payment

**Request:**
```bash
POST /api/bookings/booking_abc123/payments HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "amount": 5000,
  "paymentMethod": "UPI",
  "currency": "INR"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking payment initiated successfully",
  "data": {
    "payment": {
      "id": "pay_xyz789",
      "amount": 5000,
      "currency": "INR",
      "paymentMethod": "UPI",
      "status": "PENDING",
      "razorpayOrderId": "order_abc456",
      "transactionId": null,
      "razorpayPaymentId": null,
      "razorpaySignature": null,
      "bookingId": "booking_abc123",
      "packageId": null,
      "userId": "user_def456",
      "metadata": {
        "bookingId": "booking_abc123",
        "totalBookingAmount": 5000,
        "remainingBalance": 0
      },
      "paymentType": "BOOKING",
      "createdAt": "2026-02-11T10:30:00Z",
      "updatedAt": "2026-02-11T10:30:00Z"
    },
    "razorpayOrder": {
      "orderId": "order_abc456",
      "amount": 500000,
      "currency": "INR"
    },
    "booking": {
      "id": "booking_abc123",
      "totalAmount": 5000,
      "paidAmount": 0,
      "remainingBalance": 5000
    }
  }
}
```

### Example 2: Verify Payment

**Request:**
```bash
POST /api/payments/pay_xyz789/verify HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "razorpayOrderId": "order_abc456",
  "razorpayPaymentId": "pay_test_1234567890",
  "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "success": true,
    "paymentId": "pay_xyz789",
    "status": "PAID",
    "message": "Payment verified successfully"
  }
}
```

### Example 3: Get Payment Details

**Request:**
```bash
GET /api/payments/pay_xyz789 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "id": "pay_xyz789",
    "amount": 5000,
    "currency": "INR",
    "paymentMethod": "UPI",
    "status": "PAID",
    "transactionId": "pay_test_1234567890",
    "razorpayOrderId": "order_abc456",
    "razorpayPaymentId": "pay_test_1234567890",
    "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
    "bookingId": "booking_abc123",
    "packageId": null,
    "userId": "user_def456",
    "metadata": {...},
    "paymentType": "BOOKING",
    "createdAt": "2026-02-11T10:30:00Z",
    "updatedAt": "2026-02-11T10:35:00Z",
    "booking": {
      "id": "booking_abc123",
      "guestName": "John Doe",
      "propertyTitle": "Beach Villa",
      "totalAmount": 5000,
      "checkInDate": "2026-02-15",
      "checkOutDate": "2026-02-20"
    },
    "user": {
      "id": "user_def456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  }
}
```

---

## 🔐 Security Implementation

### Authentication Flow

```
User Request
  │
  └─ withAuth Middleware
      │
      ├─ Extract JWT from Authorization header
      │
      ├─ Verify JWT signature
      │   └─ Check JWT_SECRET
      │
      ├─ Decode JWT payload
      │   └─ Extract: userId, role, expiresAt
      │
      ├─ Pass user context to route handler
      │
      └─ Hand off to API Route
          │
          User Context = {
            userId: "user_xyz",
            role: "USER",
            email: "user@example.com"
          }
```

### Authorization Checks

```
Booking Payment Authorization:
  │
  ├─ User A initiates payment for booking
  │
  ├─ Route handler checks:
  │   ├─ Booking exists? ✓
  │   ├─ User is guest of booking?
  │   │   └─ booking.guestId === user.userId ✓
  │   └─ Amount <= remaining balance?
  │       └─ amount <= (booking.totalAmount - paidAmount) ✓
  │
  └─ If all checks pass → Process payment

Package Payment Authorization:
  │
  ├─ Owner initiates package payment
  │
  ├─ Route handler checks:
  │   ├─ Package exists? ✓
  │   ├─ User is owner of package?
  │   │   └─ package.ownerId === user.userId ✓
  │   ├─ Amount matches package price?
  │   │   └─ amount === package.price ✓
  │   └─ No active subscription exists?
  │       └─ No PAID payment for this package ✓
  │
  └─ If all checks pass → Process payment
```

### Signature Verification

```
Frontend sends:
  ├─ razorpay_order_id
  ├─ razorpay_payment_id
  └─ razorpay_signature

Server calculates:
  │
  ├─ body = `${orderId}|${paymentId}`
  ├─ expected = HMAC-SHA256(body, SECRET_KEY)
  │
  └─ Compare: expected === provided signature
      └─ If match → Payment is authentic ✓
```

---

## 📦 Database Integration

### Payment Model

```sql
CREATE TABLE "Payment" (
  id                  TEXT PRIMARY KEY,
  amount              FLOAT NOT NULL,
  currency            TEXT DEFAULT 'INR',
  paymentMethod       TEXT,
  status              TEXT DEFAULT 'PENDING',
  transactionId       TEXT UNIQUE,
  razorpayOrderId     TEXT,
  razorpayPaymentId   TEXT,
  razorpaySignature   TEXT,
  bookingId           TEXT UNIQUE,
  userId              TEXT NOT NULL,
  packageId           TEXT,
  metadata            JSON,
  createdAt           TIMESTAMP DEFAULT now(),
  updatedAt           TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (bookingId) REFERENCES "Booking"(id),
  FOREIGN KEY (userId) REFERENCES "User"(id),
  FOREIGN KEY (packageId) REFERENCES "OwnerPackage"(id),
  
  INDEX (userId),
  INDEX (bookingId),
  INDEX (status),
  INDEX (createdAt)
);
```

### Relationships

```
Payment
  ├─ User (1:N) → One user can have many payments
  ├─ Booking (1:1) → One payment per booking
  ├─ OwnerPackage (1:N) → Multiple payments per package
  │                       (over time, different owners)
  │
  └─ Data Flow:
      ├─ Payment.userId → User.id
      ├─ Payment.bookingId → Booking.id
      └─ Payment.packageId → OwnerPackage.id
```

---

## 🧪 Testing Integration Points

### Unit Testing (Service Methods)
```
paymentService.initiatePayment()
  ├─ Test: Invalid amount → throws error ✓
  ├─ Test: Missing bookingId & packageId → throws error ✓
  ├─ Test: Non-existent booking → throws error ✓
  └─ Test: Valid input → creates order & returns data ✓

paymentService.verifyPayment()
  ├─ Test: Invalid signature → returns success: false ✓
  ├─ Test: Valid signature → updates status & returns success: true ✓
  └─ Test: Unauthorized user → throws error ✓
```

### Integration Testing (API Routes)
```
POST /api/bookings/:id/payments
  ├─ Test: No JWT → 401 Unauthorized ✓
  ├─ Test: Invalid booking ID → 404 Not Found ✓
  ├─ Test: Unauthorized user (not guest) → 403 Forbidden ✓
  ├─ Test: Valid request → 201 Created ✓
  └─ Test: Response includes razorpayOrder details ✓
```

### End-to-End Testing
```
User initiates payment
  ├─ Frontend shows amount & order ID
  ├─ User completes payment in Razorpay modal
  ├─ Frontend verifies payment signature
  ├─ Backend updates payment status
  ├─ Frontend confirms payment success
  └─ Database shows payment as PAID ✓
```

---

## 🚀 Deployment Checklist

### Before Production

**Code Changes:**
- [ ] Replace test Razorpay keys with live keys
- [ ] Update JWT_SECRET to production value
- [ ] Remove debug logging from paymentService
- [ ] Enable rate limiting on endpoints
- [ ] Add CORS configuration
- [ ] Set up error tracking (Sentry, etc.)

**Configuration:**
- [ ] Production database URL
- [ ] Environment variables for all services
- [ ] SSL/TLS certificates
- [ ] HTTPS enforced
- [ ] API rate limiting configured
- [ ] Request logging configured

**Testing:**
- [ ] All endpoints tested with production data
- [ ] Payment verification with live signatures
- [ ] Refund testing with live API
- [ ] User authorization verified
- [ ] Error handling tested
- [ ] Database backups configured

**Operations:**
- [ ] Monitoring setup (logs, metrics)
- [ ] Alert rules configured
- [ ] On-call rotation established
- [ ] Support documentation prepared
- [ ] Incident response plan ready
- [ ] Rollback procedure tested

---

## 📞 Support Contacts

### Development Support
- Check: [PAYMENT_API_TESTING_SCENARIOS.md](./PAYMENT_API_TESTING_SCENARIOS.md)
- Check: [RAZORPAY_TESTING_GUIDE.md](./RAZORPAY_TESTING_GUIDE.md)
- Check: [PAYMENTS_API_DOCUMENTATION.md](./PAYMENTS_API_DOCUMENTATION.md)

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com/
- Email: support@razorpay.com
- Docs: https://razorpay.com/docs/

---

**Integration Status**: ✅ COMPLETE  
**Ready Level**: Ready for Development Testing  
**Notes**: Notifications deferred, all payment functions operational
