# Booking & Inquiry APIs - Summary

## What's Been Created

### 1. **Type Definitions**

#### `/src/types/booking.ts` - Short-Term Bookings
- `CreateShortBookingRequest` - Guest creates booking with dates
- `ShortBookingDTO` - Complete booking details (nights, pricing, guest info)
- `BookingStatus` enum - PENDING, CONFIRMED, COMPLETED, CANCELLED
- `PaymentStatus` enum - PENDING, PARTIAL, PAID, REFUNDED
- `UpdateBookingStatusRequest` - Owner accepts/rejects

#### `/src/types/inquiry.ts` - Long-Term & Buy Inquiries
- `BaseInquiry` - Common fields for all inquiries
- `LongRentInquiry` - extends BaseInquiry (start date, duration, monthly price)
- `BuyInquiry` - extends BaseInquiry (total property price)
- `InquiryStatus` enum - PENDING, REVIEWED, INTERESTED, REJECTED, CLOSED
- `UpdateInquiryRequest` - Owner's response

---

## API Endpoints Structure

### Bookings (Short-Term Only)
```
POST   /api/bookings              - Create booking
GET    /api/bookings              - List with filters
PATCH  /api/bookings/{id}         - Owner: accept/confirm/cancel
DELETE /api/bookings/{id}         - Guest: cancel booking
```

### Inquiries (Long-Rent & Buy)
```
POST   /api/inquiries             - Create inquiry
GET    /api/inquiries             - List with filters
PATCH  /api/inquiries/{id}        - Owner: respond to inquiry
DELETE /api/inquiries/{id}        - Close inquiry
```

---

## Three Transaction Types

### 1️⃣ Short-Term Rent (Nights)
- **User Action**: Selects check-in/check-out dates → Creates BOOKING
- **Guest Sees**: Price per night + cleaning fee + service fee
- **Flow**:
  1. Guest fills: check-in date, check-out date, number of guests, payment method
  2. System calculates: nights, pricing, total amount
  3. Guest pays immediately (booking shows as PENDING payment)
  4. Owner accepts/rejects booking (PENDING → CONFIRMED or CANCELLED)
  5. On check-in: status changes to checked_in
  6. On check-out: status changes to COMPLETED
- **Owner Dashboard**: Sees all bookings, accepts/cancels with notes

### 2️⃣ Long-Term Rent (Months)
- **User Action**: Fills inquiry form → Creates INQUIRY
- **Guest Sees**: Price per month + security deposit + estimated total
- **Flow**:
  1. Guest fills: start date, duration (months), occupants, message
  2. System auto-fills: monthly price, min/max lease, security deposit
  3. System creates INQUIRY (status: PENDING)
  4. Owner gets notification email
  5. Owner responds with INTERESTED/REJECTED status + message
  6. Guest gets email with owner's response
  7. If interested, they negotiate terms (outside API)
- **Owner Dashboard**: Sees all inquiries, can respond with status + message

### 3️⃣ Buy Property
- **User Action**: Fills inquiry form → Creates INQUIRY
- **Guest Sees**: Total property price + inquiry form
- **Flow**:
  1. Guest fills: message only (name, phone auto-fill if logged in)
  2. System creates INQUIRY (status: PENDING)
  3. Owner gets notification
  4. Owner responds with INTERESTED/REJECTED + message
  5. Guest receives owner's response
  6. Further communication happens outside API
- **Owner Dashboard**: Sees all inquiries, responds with status + message

---

## API Response Pattern

All endpoints follow this pattern:

```typescript
{
  success: boolean;
  message: string;
  data: {
    // Response-specific data
  }
}
```

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

---

## Property Details Page Integration Points

### For Short-Term Rent:
```
Component: FeaturedProperties → Click → Property Details Page
Form: 
  - Check-in date input
  - Check-out date input
  - Guest count selector (max = property.maxGuests)
  - Payment method dropdown
  - "Book Now" button
  
POST /api/bookings with:
  { propertyId, checkInDate, checkOutDate, numberOfGuests, paymentMethod }
```

### For Long-Term Rent:
```
Component: FeaturedProperties → Click → Property Details Page
Form:
  - Start date input
  - Duration selector (min/max from property)
  - Number of occupants
  - Message textarea (auto-fills if logged in)
  - "Send Inquiry" button
  
POST /api/inquiries with:
  { propertyId, desiredStartDate, desiredDurationMonths, numberOfOccupants, message }
```

### For Buy:
```
Component: FeaturedProperties → Click → Property Details Page
Form:
  - Name field (auto-fills if logged in)
  - Phone field (auto-fills if logged in)
  - Message textarea
  - "Send Inquiry" button
  
POST /api/inquiries with:
  { propertyId, message }
```

---

## Database Requirements

### Bookings Table
```sql
- id (string, PK)
- propertyId (FK)
- guestId (FK)
- ownerId (FK)
- checkInDate
- checkOutDate
- numberOfNights (calculated)
- numberOfGuests
- pricePerNight
- cleaningFee
- serviceFee
- totalAmount
- paymentStatus
- paymentMethod
- paidAmount
- balanceAmount
- bookingStatus
- specialRequests
- createdAt
- updatedAt
```

### Inquiries Table
```sql
- id (string, PK)
- propertyId (FK)
- guestId (FK)
- ownerId (FK)
- inquiryType (LONG_RENT | BUY)
- message
- ownerResponse
- status
- (For LONG_RENT only):
  - desiredStartDate
  - desiredDurationMonths
  - numberOfOccupants
  - pricePerMonth
  - securityDeposit
- createdAt
- updatedAt
```

---

## Next Steps

1. **Property Details Page Integration** (No API calls yet - keep hardcoded)
   - Show correct forms based on property.listingType
   - Validate guest count vs property capacity
   - Calculate and display pricing
   - Auto-fill forms if logged in

2. **Database Implementation**
   - Connect Prisma models to API endpoints
   - Implement filters and queries

3. **Payment Processing**
   - Integrate Stripe/PayPal for short-term bookings
   - Process payments in POST /api/bookings

4. **Email Notifications**
   - Send confirmation emails to guests
   - Send notifications to owners
   - Send responses from owners to guests

5. **Owner/User Dashboard Integration**
   - Fetch and display bookings/inquiries
   - Allow owner to accept/reject
   - Show status updates to guest

---

## Files Modified/Created

✅ `/src/types/booking.ts` - Complete booking types
✅ `/src/types/inquiry.ts` - Complete inquiry types
✅ `/src/app/api/bookings/route.ts` - POST/GET with proper structure
✅ `/src/app/api/bookings/[id]/route.ts` - PATCH/DELETE with proper structure
✅ `/src/app/api/inquiries/route.ts` - POST/GET with proper structure
✅ `/src/app/api/inquiries/[id]/route.ts` - PATCH/DELETE with proper structure
✅ `/API_SCHEMA.md` - Complete API documentation

**Status**: 🟢 Ready for property details page integration (no database/payment yet)
