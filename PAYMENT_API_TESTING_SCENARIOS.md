# Payment API Integration Testing Guide

## 🎯 Quick Start

### Prerequisites
- Node.js and npm installed
- Database running (PostgreSQL)
- Development server: `npm run dev`
- Port 3000 accessible

### Test Environment
```
RAZORPAY_KEY_ID=rzp_test_1DP5MMOk6cuISJ
RAZORPAY_KEY_SECRET=wnHf7QWagFLsDp3IyNpm24bP
Environment: Testing Mode (NO REAL TRANSACTIONS)
```

---

## 📱 Test Credentials

### Test Payment Methods

| Method | Test Details |
|--------|-------------|
| **Credit/Debit Card** | `4111111111111111` / Any future expiry / Any CVV |
| **UPI** | `success@razorpay` |
| **Net Banking** | All banks available in test mode |

### Test Users
1. Create own test account via signup
2. Or use existing test user accounts

---

## 🧪 Test Scenario 1: Booking Payment Flow

### Setup
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Get credentials
# 1. Open http://localhost:3000/login
# 2. Sign up with test email: test@example.com / password123
# 3. Create a booking for a property
# 4. Note the bookingId from the database or API response
```

### Test Steps

#### Step 1: Initiate Booking Payment
```bash
# Using cURL
curl -X POST http://localhost:3000/api/bookings/{bookingId}/payments \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentMethod": "UPI"
  }'

# OR Using JavaScript fetch
const response = await fetch('/api/bookings/booking_123/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    paymentMethod: 'UPI'
  })
});

const { data } = await response.json();
console.log('Payment ID:', data.payment.id);
console.log('Order ID:', data.razorpayOrder.orderId);
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking payment initiated successfully",
  "data": {
    "payment": {
      "id": "pay_xyz123",
      "amount": 5000,
      "currency": "INR",
      "paymentMethod": "UPI",
      "status": "PENDING",
      "razorpayOrderId": "order_abc456",
      "bookingId": "booking_789",
      "userId": "user_456"
    },
    "razorpayOrder": {
      "orderId": "order_abc456",
      "amount": 500000,
      "currency": "INR"
    },
    "booking": {
      "id": "booking_789",
      "totalAmount": 5000,
      "paidAmount": 0,
      "remainingBalance": 5000
    }
  }
}
```

#### Step 2: Simulate Razorpay Payment Modal

In a browser environment, you would:
```typescript
// Script in your page
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<script>
const options = {
  key: 'rzp_test_1DP5MMOk6cuISJ',
  amount: 500000, // From API response
  currency: 'INR',
  order_id: 'order_abc456', // From API response
  handler(response) {
    // Save these for verification
    window.paymentResponse = response;
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
</script>
```

For testing, you'll get:
```json
{
  "razorpay_order_id": "order_abc456",
  "razorpay_payment_id": "pay_TestPayment123",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

#### Step 3: Verify Payment Signature
```bash
curl -X POST http://localhost:3000/api/payments/pay_xyz123/verify \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_abc456",
    "razorpayPaymentId": "pay_TestPayment123",
    "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "success": true,
    "paymentId": "pay_xyz123",
    "status": "PAID",
    "message": "Payment verified successfully"
  }
}
```

#### Step 4: Verify Booking Status Updated
```bash
curl -X GET http://localhost:3000/api/bookings/booking_789 \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

**Expected Response:**
```json
{
  "paymentStatus": "PAID",
  "paidAmount": 5000,
  "balanceAmount": 0
}
```

---

## 🎁 Test Scenario 2: Package Purchase (Owner)

### Setup
```bash
# 1. Create owner account via signup with role: OWNER
# 2. Get a packageId from /api/packages
# 3. Note the package price
```

### Test Steps

#### Step 1: Initiate Package Payment
```bash
curl -X POST http://localhost:3000/api/packages/{packageId}/payments \
  -H "Authorization: Bearer {OWNER_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9999,
    "paymentMethod": "CREDIT_CARD"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Package payment initiated successfully",
  "data": {
    "payment": {
      "id": "pay_pkg123",
      "amount": 9999,
      "status": "PENDING",
      "packageId": "pkg_456"
    },
    "razorpayOrder": {
      "orderId": "order_pkg123"
    },
    "package": {
      "id": "pkg_456",
      "name": "Premium Package",
      "price": 9999,
      "tier": "PREMIUM",
      "listingCredits": 50,
      "duration": 30
    }
  }
}
```

#### Step 2: Verify Payment
(Same process as Scenario 1)

#### Step 3: Confirm Package Benefits
```bash
GET /api/packages/{packageId}
```

Should show active subscription with:
- Listing credits: 50
- Duration: 30 days
- Status: Active

---

## 💰 Test Scenario 3: Partial Payment

### Setup
```
Booking total: ₹15,000
Initial payment: ₹10,000
Remaining: ₹5,000
```

### Test Steps

#### Step 1: First Payment
```bash
curl -X POST http://localhost:3000/api/bookings/booking_789/payments \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "paymentMethod": "UPI"}'
```

**Verify payment status changes to PARTIAL:**
```bash
GET /api/bookings/booking_789
# Response: paymentStatus = "PARTIAL", paidAmount = 10000
```

#### Step 2: Second Payment (Remaining Balance)
```bash
curl -X POST http://localhost:3000/api/bookings/booking_789/payments \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "paymentMethod": "UPI"}'
```

**Verify final status:**
```bash
GET /api/bookings/booking_789
# Response: paymentStatus = "PAID", paidAmount = 15000
```

---

## 🔄 Test Scenario 4: Refund Processing

### Setup
```
Completed payment: ₹5,000
Status: PAID
```

### Test Steps

#### Step 1: Request Refund
```bash
curl -X POST http://localhost:3000/api/payments/pay_xyz123/refund \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Booking cancelled by guest",
    "amount": 5000
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "rfnd_xyz789",
    "paymentId": "pay_xyz123",
    "amount": 5000,
    "status": "issued",
    "message": "Refund processed successfully"
  }
}
```

#### Step 2: Verify Status Changed
```bash
GET /api/payments/pay_xyz123
# Response: status = "REFUNDED"
```

---

## 📊 Test Scenario 5: Payment Filtering & Pagination

### Test Steps

#### Get All Payments
```bash
curl -X GET "http://localhost:3000/api/payments" \
  -H "Authorization: Bearer {TOKEN}"
```

#### Filter by Status
```bash
curl -X GET "http://localhost:3000/api/payments?status=PAID" \
  -H "Authorization: Bearer {TOKEN}"
```

#### Filter by Payment Method
```bash
curl -X GET "http://localhost:3000/api/payments?paymentMethod=UPI" \
  -H "Authorization: Bearer {TOKEN}"
```

#### Filter by Booking
```bash
curl -X GET "http://localhost:3000/api/payments?bookingId=booking_789" \
  -H "Authorization: Bearer {TOKEN}"
```

#### Pagination
```bash
# First page
curl -X GET "http://localhost:3000/api/payments?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"

# Second page
curl -X GET "http://localhost:3000/api/payments?page=2&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

---

## ⚠️ Test Scenario 6: Error Cases

### Invalid Amount
```bash
curl -X POST http://localhost:3000/api/bookings/booking_789/payments \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"amount": -100, "paymentMethod": "UPI"}'

# Expected: 400 "Amount must be greater than 0"
```

### Insufficient Balance
```bash
curl -X POST http://localhost:3000/api/bookings/booking_789/payments \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"amount": 20000, "paymentMethod": "UPI"}'
# Booking total: 5000

# Expected: 400 "Payment amount cannot exceed remaining balance of 5000"
```

### Unauthorized Access
```bash
curl -X GET http://localhost:3000/api/payments/pay_other_user_payment \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Expected: 403 "Unauthorized"
```

### Payment Not Found
```bash
curl -X GET http://localhost:3000/api/payments/invalid_id \
  -H "Authorization: Bearer {TOKEN}"

# Expected: 404 "Payment not found"
```

### Invalid Signature
```bash
curl -X POST http://localhost:3000/api/payments/pay_xyz/verify \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_123",
    "razorpayPaymentId": "pay_456",
    "razorpaySignature": "invalid_signature"
  }'

# Expected: 400 "Payment signature verification failed"
```

---

## 🛠️ Tools & Resources

### Browser DevTools
1. **Network Tab**: Monitor API calls
2. **Console**: Check for errors
3. **LocalStorage**: Find JWT token under `auth_token`

### Postman Collection
```json
{
  "info": {
    "name": "Payment APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Initiate Booking Payment",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/bookings/{{bookingId}}/payments",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"amount\": 5000, \"paymentMethod\": \"UPI\"}"
        }
      }
    }
  ]
}
```

### Razorpay Dashboard
- **URL**: https://dashboard.razorpay.com/
- **Mode**: Switch to Test Mode (sidebar toggle)
- **View**: All test transactions, orders, payments

---

## ✅ Checklist

- [ ] Razorpay SDK installed
- [ ] Test credentials in `.env.local`
- [ ] Database connected and running
- [ ] Development server started: `npm run dev`
- [ ] Can create test user account
- [ ] Can create test booking
- [ ] Can initiate payment successfully
- [ ] Can complete payment in test mode
- [ ] Can verify payment signature
- [ ] Payment status updates in database
- [ ] Booking payment status reflects payment
- [ ] Can request refund
- [ ] Refund status updates correctly
- [ ] Error handling works for invalid inputs
- [ ] Authorization checks prevent unauthorized access

---

## 🚀 Ready for Testing!

All endpoints are configured and ready. Start with Scenario 1 (Booking Payment) to ensure the full flow works, then test other scenarios.

For issues, check:
1. Console logs for errors
2. Razorpay Dashboard for transaction details
3. Database for payment records
4. Network tab for API responses
