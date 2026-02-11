# Razorpay Testing Mode Setup & Integration Guide

## ✅ Setup Status

### Completed Configuration
- ✅ Razorpay SDK installed (`razorpay` npm package)
- ✅ Test credentials configured in `.env.local`
- ✅ Razorpay instance initialized in `/lib/razorpay.ts`
- ✅ Payment service configured to use Razorpay instance
- ✅ All payment APIs integrated and ready

---

## 🔑 Razorpay Testing Credentials

**Current Setup (Testing Mode):**
```
RAZORPAY_KEY_ID=rzp_test_1DP5MMOk6cuISJ
RAZORPAY_KEY_SECRET=wnHf7QWagFLsDp3IyNpm24bP
```

**Key Features:**
- ✅ Testing mode - NO REAL MONEY IS CHARGED
- ✅ Test transactions don't affect real accounts
- ✅ Full feature parity with production
- ✅ Supports all payment methods in test environment

---

## 📋 Available Test Payment Methods

### Test Debit/Credit Cards
```
Card Number: 4111111111111111
Expiry: Any future date (MM/YY)
CVV: Any 3-digit number
```

### Test UPI
```
VPA: success@razorpay
```

### Test Net Banking
```
All methods available in test environment
```

---

## 🚀 API Endpoints - Ready to Use

### 1. Initiate Payment
```bash
POST /api/payments
Authorization: Bearer <JWT_TOKEN>

{
  "amount": 1000,
  "paymentMethod": "CREDIT_CARD",
  "bookingId": "booking_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment": {
      "id": "pay_xyz",
      "amount": 1000,
      "status": "PENDING",
      "razorpayOrderId": "order_xyz"
    },
    "razorpayOrder": {
      "orderId": "order_xyz",
      "amount": 100000,
      "currency": "INR"
    }
  }
}
```

### 2. Verify Payment
```bash
POST /api/payments/:paymentId/verify
Authorization: Bearer <JWT_TOKEN>

{
  "razorpayOrderId": "order_xyz",
  "razorpayPaymentId": "pay_xyz",
  "razorpaySignature": "signature_xxx"
}
```

### 3. Get All Payments
```bash
GET /api/payments?status=PAID&page=1&limit=10
Authorization: Bearer <JWT_TOKEN>
```

### 4. Booking Payment
```bash
POST /api/bookings/:bookingId/payments
Authorization: Bearer <JWT_TOKEN>

{
  "amount": 5000,
  "paymentMethod": "UPI"
}
```

### 5. Package Payment (Owner)
```bash
POST /api/packages/:packageId/payments
Authorization: Bearer <JWT_TOKEN>

{
  "amount": 9999,
  "paymentMethod": "NET_BANKING"
}
```

### 6. Process Refund
```bash
POST /api/payments/:paymentId/refund
Authorization: Bearer <JWT_TOKEN>

{
  "reason": "Booking cancelled",
  "amount": 5000
}
```

---

## 🧪 Manual Testing Process

### Step 1: Start Development Server
```bash
cd d:\Xamp\apache\modules\MYKEYS
npm run dev
```

Server runs at: `http://localhost:3000`

### Step 2: Get JWT Token
1. Sign up at `/signup`
2. Login at `/login`
3. Copy JWT from localStorage (DevTools)

### Step 3: Create Test Booking
- Navigate to property details
- Make a booking (use test data)
- Get the `bookingId` from the response

### Step 4: Test Payment Flow

**Using Postman or cURL:**

```bash
# Step 1: Initiate Payment
curl -X POST http://localhost:3000/api/bookings/booking_id/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "paymentMethod": "UPI"}'

# Response will include:
# - payment.id (paymentId)
# - razorpayOrder.orderId
# - razorpayOrder.amount

# Step 2: Open Razorpay Modal (Frontend)
# Use the orderId and amount to initialize Razorpay checkout

# Step 3: Complete Payment in Modal
# Use test UPI: success@razorpay
# Or test card: 4111111111111111

# Step 4: Get Verification Data from Modal
# Razorpay returns:
# - razorpay_order_id
# - razorpay_payment_id
# - razorpay_signature

# Step 5: Verify Payment
curl -X POST http://localhost:3000/api/payments/payment_id/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_id",
    "razorpayPaymentId": "pay_id",
    "razorpaySignature": "signature"
  }'
```

---

## 💻 Frontend Integration Example

### React Component for Payment
```typescript
import { useState } from 'react';
import { toast } from 'sonner';

export function BookingPayment({ bookingId, amount, token }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Initiate payment
      const response = await fetch(`/api/bookings/${bookingId}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          paymentMethod: 'UPI'
        })
      });

      const { data } = await response.json();
      const { payment, razorpayOrder } = data;

      // Step 2: Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Add to .env
        amount: razorpayOrder.amount,
        currency: 'INR',
        order_id: razorpayOrder.orderId,
        name: 'MYKEYS',
        description: `Booking Payment - ${bookingId}`,
        handler: async (response) => {
          try {
            // Step 3: Verify payment
            const verifyResponse = await fetch(
              `/api/payments/${payment.id}/verify`,
              {
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
              }
            );

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              toast.success('Payment successful!');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Verification error');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
}
```

### Add to .env.local
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1DP5MMOk6cuISJ
```

### Add Razorpay Script to layout.tsx
```typescript
// In app/layout.tsx <head>
<script src="https://checkout.razorpay.com/v1/checkout.js" />
```

---

## 📊 Testing Scenarios

### Scenario 1: Successful Payment
1. Initiate payment for booking
2. Complete payment with test card: `4111111111111111`
3. Verify payment signature
4. ✅ Payment status changes to PAID
5. ✅ Booking payment status updates

### Scenario 2: Partial Payment
1. Booking amount: ₹10,000
2. Pay: ₹5,000 first
3. Status: PARTIAL
4. ✅ Remaining balance: ₹5,000

### Scenario 3: Package Purchase
1. Owner initiates package payment
2. Amount must match package price
3. ✅ Subscribe to package benefits
4. ✅ Listing credits added to account

### Scenario 4: Refund Processing
1. Complete a payment
2. Request refund with reason: "Booking cancelled"
3. ✅ Money refunded to test account
4. ✅ Status changes to REFUNDED

---

## 🔍 Debugging & Monitoring

### Check Payment Status
```bash
curl -X GET http://localhost:3000/api/payments/payment_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Payment History
```bash
curl -X GET "http://localhost:3000/api/payments?status=PAID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Razorpay Dashboard
1. Go to: https://dashboard.razorpay.com/
2. Switch to Test Mode (toggle in sidebar)
3. View all test transactions
4. Monitor payment status in real-time

### Enable Debug Logging
```typescript
// In paymentService.ts, add:
console.log('Payment initiated:', razorpayOrder);
console.log('Signature verification:', signature === data.razorpaySignature);
```

---

## ⚠️ Important Notes

### Testing Mode Characteristics
- ✅ All transactions are simulated
- ✅ No real money changes hands
- ✅ Full feature testing available
- ✅ Supports all payment methods
- ✅ Webhooks work normally
- ✅ Change to production keys when going live

### Security Best Practices
1. **Never** expose Razorpay Secret Key in frontend
2. **Always** verify signatures server-side
3. **Use** HTTPS in production
4. **Rotate** API keys periodically
5. **Monitor** Razorpay dashboard for suspicious activity

### Production Migration
When ready for production:
1. Get live Razorpay Keys from account
2. Replace test credentials in `.env.local`
3. Change `rzp_test` to `rzp_live` in keys
4. Remove debug logging
5. Enable proper error handling
6. Set up webhooks for async payment updates
7. Configure rate limiting
8. Enable fraud detection

---

## 🆘 Troubleshooting

### Issue: "Missing Razorpay credentials"
**Solution:**
```bash
# Check .env.local has:
RAZORPAY_KEY_ID=rzp_test_1DP5MMOk6cuISJ
RAZORPAY_KEY_SECRET=wnHf7QWagFLsDp3IyNpm24bP

# Restart server:
npm run dev
```

### Issue: "invalid_request_error"
**Solution:**
- Verify amount in paise conversion (multiply by 100)
- Check booking/package exists in database
- Ensure payment method is valid enum

### Issue: "signature mismatch"
**Solution:**
- Verify signature calculation matches Razorpay algorithm
- Check secret key is correct
- Ensure order_id and payment_id are not swapped

### Issue: Test payment not completing
**Solution:**
- Use correct test UPI: `success@razorpay`
- Or test card: `4111111111111111`
- Check browser console for errors
- Verify JWT token is valid

---

## 📞 Razorpay Support Resources

- **Dashboard:** https://dashboard.razorpay.com/
- **Documentation:** https://razorpay.com/docs/
- **API Reference:** https://razorpay.com/docs/api/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-keys/
- **Support:** support@razorpay.com

---

## ✨ Next Steps

1. ✅ Development testing complete
2. ⏳ Staging testing (if applicable)
3. ⏳ Production deployment with live keys
4. ⏳ Webhook integration for async updates
5. ⏳ Payment analytics dashboard
6. ⏳ Subscription management features

---

## 📝 File References

- Configuration: [src/lib/razorpay.ts](./src/lib/razorpay.ts)
- Service: [src/lib/payments/paymentService.ts](./src/lib/payments/paymentService.ts)
- Payment API: [src/app/api/payments/](./src/app/api/payments/)
- Types: [src/types/payment.ts](./src/types/payment.ts)
- Environment: [.env.local](./.env.local)

Ready to test! 🚀
