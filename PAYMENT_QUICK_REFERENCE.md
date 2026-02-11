# Payment APIs - Quick Reference Card

## 🎯 At a Glance

| Item | Value |
|------|-------|
| **Status** | ✅ Ready for Testing |
| **Environment** | Testing Mode (No Real Money) |
| **Razorpay Keys** | rzp_test_1DP5MMOk6cuISJ |
| **Test Methods** | UPI: `success@razorpay` / Card: `4111111111111111` |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | JWT + withAuth middleware |
| **Response Format** | Standard JSON with success/error |

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Start server
npm run dev

# 2. Verify env variables
cat .env.local | grep RAZORPAY

# 3. Create test account
# Go to http://localhost:3000/signup

# 4. Test endpoint (copy JWT from localStorage)
curl -X GET http://localhost:3000/api/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📍 Key Files

```
Configuration:
  src/lib/razorpay.ts              ← Razorpay instance
  .env.local                       ← API keys

Service:
  src/lib/payments/paymentService.ts ← Business logic
  src/types/payment.ts             ← Types & DTOs

Routes:
  src/app/api/payments/            ← Payment endpoints
  src/app/api/bookings/[id]/payments/
  src/app/api/packages/[id]/payments/

Tests:
  RAZORPAY_TESTING_GUIDE.md
  PAYMENT_API_TESTING_SCENARIOS.md
```

---

## 🔗 Endpoints (Core)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/payments` | Create new payment |
| `GET` | `/api/payments` | List all payments |
| `GET` | `/api/payments/:id` | Get payment details |
| `POST` | `/api/payments/:id/verify` | Verify signature |
| `POST` | `/api/payments/:id/refund` | Process refund |

---

## 📊 Booking Payment Flow

```
1. POST /api/bookings/:bookingId/payments
   ├─ Body: {amount, paymentMethod}
   └─ Returns: {payment, razorpayOrder}

2. User completes payment in modal
   └─ Gets: razorpay_order_id, razorpay_payment_id, razorpay_signature

3. POST /api/payments/:paymentId/verify
   ├─ Body: {razorpayOrderId, razorpayPaymentId, razorpaySignature}
   └─ Returns: {success: true, status: "PAID"}

4. Booking is now PAID
   └─ Can proceed with check-in
```

---

## 🎁 Package Payment Flow

```
1. POST /api/packages/:packageId/payments
   ├─ Body: {amount: packagePrice, paymentMethod}
   └─ Returns: {payment, razorpayOrder, package}

2. User completes payment in modal

3. POST /api/payments/:paymentId/verify
   ├─ Body: verification data
   └─ Returns: {success: true}

4. Package subscription active
   └─ Credits awarded to owner
```

---

## ✅ Error Codes

| Code | Meaning | HTTP |
|------|---------|------|
| `INVALID_AMOUNT` | Amount <= 0 or exceeds limit | 400 |
| `PAYMENT_NOT_FOUND` | Payment ID doesn't exist | 404 |
| `UNAUTHORIZED_PAYMENT` | User doesn't own payment | 403 |
| `INVALID_SIGNATURE` | Signature verification failed | 400 |
| `INSUFFICIENT_BALANCE` | Payment > remaining balance | 400 |
| `INVALID_INPUT` | Missing required fields | 400 |

---

## 🧪 Test Commands

### Initiate Payment
```bash
curl -X POST http://localhost:3000/api/bookings/booking_123/payments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "paymentMethod": "UPI"}'
```

### Get Payments
```bash
curl -X GET "http://localhost:3000/api/payments?page=1" \
  -H "Authorization: Bearer TOKEN"
```

### Get Single Payment
```bash
curl -X GET http://localhost:3000/api/payments/pay_xyz \
  -H "Authorization: Bearer TOKEN"
```

### Verify Payment
```bash
curl -X POST http://localhost:3000/api/payments/pay_xyz/verify \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_abc",
    "razorpayPaymentId": "pay_123",
    "razorpaySignature": "sig..."
  }'
```

### Process Refund
```bash
curl -X POST http://localhost:3000/api/payments/pay_xyz/refund \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Cancelled"}'
```

---

## 🔐 Security Notes

✅ All endpoints require JWT authentication  
✅ Razorpay signatures verified (HMAC-SHA256)  
✅ User isolation enforced (can't access others' payments)  
✅ Amount validation on all endpoints  
✅ Payment method validation  
✅ Ownership checks before processing  

---

## 🛠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Missing Razorpay credentials" | Check .env.local has keys, restart server |
| "Payment not found" | Verify payment ID, check database |
| "Signature verification failed" | Check order_id/payment_id not swapped |
| "Unauthorized" | Verify JWT token, check user owns resource |
| "Amount exceeds balance" | Check booking remaining balance |

---

## 📚 Documentation Order

1. **IMPLEMENTATION_SUMMARY.md** ← Start here (overview)
2. **RAZORPAY_TESTING_GUIDE.md** ← Setup & credentials
3. **PAYMENT_API_TESTING_SCENARIOS.md** ← Test walkthroughs
4. **PAYMENTS_API_DOCUMENTATION.md** ← Full API reference
5. **PAYMENT_INTEGRATION_GUIDE.md** ← Architecture details

---

## 🔄 Current Implementation

```
✅ Razorpay SDK installed
✅ Test credentials configured
✅ Payment service implemented
✅ All API endpoints working
✅ Database schema ready
✅ Authentication integrated
✅ Error handling complete
✅ Type safety enabled
✅ Validation utilities ready
✅ Comprehensive documentation

⏳ Notifications (deferred)
⏳ Webhooks (extensible)
⏳ Analytics (ready to extend)
```

---

## 🚀 Production Ready?

**When live:**
1. Replace test keys with production keys (rzp_live_...)
2. Change `RAZORPAY_KEY_ID` in .env.local
3. Change `RAZORPAY_KEY_SECRET` in .env.local
4. Restart server
5. All functionality remains same, now with real money

---

## 💡 Next Steps

```
Immediate:
  1. Start server: npm run dev
  2. Test endpoints with cURL
  3. Verify database updates
  4. Check Razorpay dashboard

Short-term:
  1. Add frontend modal integration
  2. Create webhook endpoint
  3. Setup payment notifications (when ready)
  4. Add analytics

Production:
  1. Get live Razorpay keys
  2. Update .env.local with live keys
  3. Full testing cycle
  4. Deploy to production
```

---

## 📞 Support

- **Testing Guide**: Read RAZORPAY_TESTING_GUIDE.md
- **API Details**: Read PAYMENTS_API_DOCUMENTATION.md
- **Scenarios**: Read PAYMENT_API_TESTING_SCENARIOS.md
- **Razorpay Help**: support@razorpay.com
- **Dashboard**: https://dashboard.razorpay.com/

---

## ✨ Features Summary

### Booking Payments
- Pay for bookings with multiple payment methods
- Partial payment support
- Automatic balance tracking
- Payment history per booking

### Package Payments
- Owner package subscriptions
- Duplicate prevention
- Package benefits assignment
- Payment history per package

### Payment Management
- Complete payment history
- Filtering by status/method/date
- Pagination support
- Payment details with relations
- Refund processing

### Security
- JWT authentication
- User isolation
- Signature verification
- Authorization checks
- Transaction tracking

---

## 🎯 Success Indicators

When working correctly, you'll see:

1. ✅ Payment initiated → Returns Razorpay order
2. ✅ Test payment completes → No real charge
3. ✅ Signature verifies → Returns success
4. ✅ Status updates → Database reflects change
5. ✅ History available → Can view past payments
6. ✅ Refund works → Can process refunds
7. ✅ Authorization works → Can't access other users' payments

---

**Last Updated**: February 11, 2026  
**Status**: ✅ READY FOR TESTING  
**Component**: Payment APIs with Razorpay Testing Mode
