# MYKEYS API Schema Documentation

## Booking & Inquiry System

### Overview
The system supports three types of property transactions:
1. **Short-Term Rent** (Night-based booking) - User books by selecting check-in/check-out dates
2. **Long-Term Rent** (Month-based inquiry) - User sends inquiry with desired duration
3. **Buy** (Purchase inquiry) - User sends inquiry for property purchase

---

## 1. SHORT-TERM BOOKING (NIGHTS)

### Endpoints

#### POST /api/bookings
**Create a new short-term booking**

**Request Body:**
```typescript
{
  propertyId: string;           // Required
  checkInDate: string;          // Required, ISO date format (YYYY-MM-DD)
  checkOutDate: string;         // Required, ISO date format (YYYY-MM-DD)
  numberOfGuests: number;       // Required, must not exceed property.maxGuests
  specialRequests?: string;     // Optional
  paymentMethod: PaymentMethod; // "CREDIT_CARD" | "DEBIT_CARD" | "UPI" | "BANK_TRANSFER" | "WALLET"
}
```

**Response (201 Created):**
```typescript
{
  success: true,
  message: "Booking created successfully",
  data: {
    id: string;                 // BOOK-{timestamp}
    bookingType: "SHORT_TERM";
    propertyId: string;
    propertyTitle: string;
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    
    // Dates & Duration
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;     // Calculated automatically
    numberOfGuests: number;
    
    // Pricing
    pricePerNight: number;      // From property
    totalNights: number;
    subtotal: number;           // pricePerNight * totalNights
    cleaningFee: number;
    serviceFee: number;
    totalAmount: number;        // subtotal + cleaningFee + serviceFee
    
    // Payment
    paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
    paymentMethod: string;
    paidAmount: number;
    balanceAmount: number;
    
    // Status
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    specialRequests?: string;
    ownerId: string;
    createdAt: string;          // ISO timestamp
    updatedAt: string;          // ISO timestamp
    checkInStatus?: "pending" | "checked_in" | "checked_out";
  }
}
```

**Business Logic:**
- Calculate numberOfNights from dates
- Fetch property and validate:
  - numberOfGuests <= property.maxGuests
  - Dates don't conflict with other bookings
- Calculate pricing from property.pricePerNight
- Initialize paymentStatus as PENDING
- Send confirmation email to guest
- Send notification to owner

---

#### GET /api/bookings
**Fetch all bookings with filters**

**Query Parameters:**
```
propertyId?   - Filter by property
guestId?      - Filter by guest
ownerId?      - Filter by owner
status?       - Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
paymentStatus? - Filter by payment status
from?         - From date (ISO format)
to?           - To date (ISO format)
page?         - Page number (default: 1)
pageSize?     - Items per page (default: 10)
```

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Bookings retrieved successfully",
  data: {
    items: ShortBookingDTO[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
}
```

---

#### PATCH /api/bookings/{id}
**Update booking status (Owner action)**

Only the property owner can accept/reject/cancel bookings.

**Request Body:**
```typescript
{
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string;  // Optional notes from owner
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Booking status updated to {status}",
  data: ShortBookingDTO;
}
```

**Business Logic:**
- Verify user is the property owner
- Validate status transitions (e.g., PENDING → CONFIRMED or CANCELLED)
- If CANCELLED:
  - Calculate refund based on cancellation policy
  - Process refund
  - Notify guest
- Send notification emails to both parties
- Update lastStatusChange timestamp

---

#### DELETE /api/bookings/{id}
**Cancel booking (Guest action)**

Only the guest who created the booking can cancel.

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Booking cancelled successfully",
  data: null
}
```

**Business Logic:**
- Verify user is the guest
- Check if cancellation is allowed (check cancellation policy dates)
- Calculate refund amount
- Process refund if applicable
- Update status to CANCELLED
- Send cancellation confirmation to guest
- Notify owner of cancellation

---

## 2. LONG-TERM RENT (INQUIRY)

### Endpoints

#### POST /api/inquiries
**Create a long-term rental inquiry**

When user selects long-term rent property, they don't book directly but send an inquiry.

**Request Body for Long-Term:**
```typescript
{
  propertyId: string;              // Required
  desiredStartDate: string;        // Required, ISO date format
  desiredDurationMonths: number;   // Required, between property.minLease and maxLease
  numberOfOccupants: number;       // Required
  message: string;                 // Required, inquiry message
}
```

**Response (201 Created):**
```typescript
{
  success: true,
  message: "Inquiry created successfully",
  data: {
    id: string;                  // INQ-LONG-{timestamp}
    propertyId: string;
    propertyTitle: string;
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    ownerId: string;
    
    // Inquiry Details
    desiredStartDate: string;
    desiredDurationMonths: number;
    numberOfOccupants: number;
    
    // Pricing
    pricePerMonth: number;       // From property
    minLeasePeriod: number;      // Property's minLease
    maxLeasePeriod?: number;     // Property's maxLease
    securityDeposit: number;     // Usually 1-1.5 months rent
    estimatedMonthlyTotal: number; // pricePerMonth * desiredDurationMonths
    
    // Messages
    message: string;             // Guest's inquiry
    ownerResponse?: string;      // Owner's response (initially empty)
    
    // Status
    status: "PENDING" | "REVIEWED" | "INTERESTED" | "REJECTED" | "CLOSED";
    
    createdAt: string;
    updatedAt: string;
  }
}
```

**Business Logic:**
- Validate desiredDurationMonths is within property.minLease and maxLease
- Fetch property details and pricing
- Create inquiry with PENDING status
- Send notification email to owner
- Send confirmation email to guest

---

#### PATCH /api/inquiries/{id}
**Owner responds to inquiry**

**Request Body:**
```typescript
{
  status: "REVIEWED" | "INTERESTED" | "REJECTED" | "CLOSED";
  ownerResponse: string;  // Owner's message response
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Inquiry status updated to {status}",
  data: LongRentInquiryDTO;
}
```

**Business Logic:**
- Verify user is the property owner
- Update inquiry status
- Add owner's response message
- Update lastReplyAt timestamp
- Send email to guest with owner's response
- If status is INTERESTED, owner can proceed to booking creation

---

## 3. BUY PROPERTY (INQUIRY)

### Endpoints

#### POST /api/inquiries
**Create a buy property inquiry**

**Request Body for Buy:**
```typescript
{
  propertyId: string;    // Required
  message: string;       // Required, inquiry message
}
```

**Response (201 Created):**
```typescript
{
  success: true,
  message: "Inquiry created successfully",
  data: {
    id: string;                // INQ-BUY-{timestamp}
    propertyId: string;
    propertyTitle: string;
    propertyPrice: number;     // Total property price
    guestId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    ownerId: string;
    
    message: string;           // Inquiry message
    ownerResponse?: string;    // Will be filled by owner
    
    status: "PENDING" | "REVIEWED" | "INTERESTED" | "REJECTED" | "CLOSED";
    
    createdAt: string;
    updatedAt: string;
  }
}
```

**Business Logic:**
- Fetch property and get total price
- Create inquiry with PENDING status
- Send notification to owner
- Send confirmation to guest

---

#### PATCH /api/inquiries/{id}
**Owner responds to buy inquiry**

**Request Body:**
```typescript
{
  status: "REVIEWED" | "INTERESTED" | "REJECTED" | "CLOSED";
  ownerResponse: string;  // Owner's response message
}
```

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Inquiry status updated to {status}",
  data: BuyInquiryDTO;
}
```

**Business Logic:**
- Verify user is property owner
- Update inquiry status and response
- Send email to guest
- If status is INTERESTED, owner and guest can discuss terms

---

#### DELETE /api/inquiries/{id}
**Close inquiry**

Can be done by guest or owner.

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Inquiry closed successfully",
  data: null
}
```

**Business Logic:**
- Verify user is guest or owner
- Mark inquiry as CLOSED (don't delete from DB)
- Send notification to both parties

---

## API Error Responses

All errors return in this format:

```typescript
{
  success: false,
  message: "Error description",
  data: null
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden (permission denied)
- 404: Not Found
- 500: Server Error

---

## Summary

| Feature | Short Rent | Long Rent | Buy |
|---------|-----------|-----------|-----|
| Action Type | Booking | Inquiry | Inquiry |
| User Creates | Booking | Inquiry | Inquiry |
| Owner Approves | Yes (PATCH) | Yes (PATCH) | Yes (PATCH) |
| Payment | Immediate | Negotiated | Not handled by API |
| Duration | Check-in/Check-out dates | Month-based | N/A |
| Price Shown | Per night + fees | Per month + deposit | Total |
| Auto-fill | - | - | - |
| Confirmation Email | To guest | To both parties | To both parties |

---

## Implementation TODO

### Backend
- [ ] Connect to Prisma models
- [ ] Implement database queries
- [ ] Add authentication/authorization
- [ ] Process payments (Stripe/PayPal)
- [ ] Send emails (nodemailer)
- [ ] Validate cancellation policies
- [ ] Calculate refunds
- [ ] Add logging

### Frontend (Property Details Page)
- [ ] Short Rent: Form with check-in/check-out dates + payment
- [ ] Long Rent: Form with start date, duration, occupants + message
- [ ] Buy: Simple inquiry form with message
- [ ] Show appropriate pricing based on type
- [ ] Auto-fill form if logged in
- [ ] Integrate with api.ts
