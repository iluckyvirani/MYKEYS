# Admin Dashboard APIs Documentation

## Overview

This document provides comprehensive documentation for the Admin Dashboard APIs created for the MYKEYS rental SaaS platform. All APIs follow the same architectural patterns used throughout the application.

## Architecture & Patterns

### 1. **Authentication & Authorization**
- All endpoints use the `withAuth` middleware wrapper
- Role-based access control (RBAC) - `ADMIN` role required
- JWT token-based authentication
- Tokens extracted from `Authorization` header or cookies

### 2. **Response Format**
All API responses follow a standardized format:

```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": {...},
  "code": "ERROR_CODE"  // Only on errors
}
```

### 3. **Pagination**
Paginated endpoints support:
- `page` (default: 1)
- `pageSize` (default: 10)
- Response includes total count and pagination info

### 4. **Error Handling**
- Standardized HTTP status codes
- Meaningful error messages
- Error codes for programmatic handling

---

## API Endpoints

### 📊 Admin Statistics & Reports

#### GET `/api/admin/stats`
Get comprehensive dashboard statistics
- **Authentication**: Required (ADMIN role)
- **Query Params**:
  - `from` (optional): Start date for filtering
  - `to` (optional): End date for filtering

**Response Data**:
```json
{
  "summary": {
    "totalUsers": 150,
    "totalOwners": 45,
    "totalServiceProviders": 30,
    "totalProperties": 200,
    "activeProperties": 180,
    "conversionRate": "45.50%",
    "occupancyRate": "65.25%"
  },
  "bookings": {
    "total": 500,
    "completed": 450,
    "pending": 50,
    "completionRate": "90.00"
  },
  "payments": {
    "total": 480,
    "paid": 450,
    "failed": 30,
    "totalRevenue": 5000000,
    "averageValue": "10416.67",
    "successRate": "93.75"
  },
  "inquiries": {
    "total": 250,
    "new": 25,
    "unresolved": 225
  },
  "distributions": {
    "usersByRole": [
      { "role": "USER", "count": 100 },
      { "role": "OWNER", "count": 45 }
    ],
    "paymentsByMethod": [
      { "method": "UPI", "count": 250 },
      { "method": "CREDIT_CARD", "count": 200 }
    ]
  }
}
```

#### PATCH `/api/admin/stats`
Generate detailed reports by type and period
- **Query Params**:
  - `type`: "users" | "properties" | "bookings" | "revenue"
  - `period`: "day" | "week" | "month" | "year"

---

### 👥 Admin Users Management

#### GET `/api/admin/users`
Get all users with advanced filtering
- **Query Params**:
  - `page`: Number (default: 1)
  - `pageSize`: Number (default: 10)
  - `role`: "USER" | "OWNER" | "SERVICE" | "ALL" (default: ALL)
  - `status`: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
  - `search`: Search by email, name, or phone
  - `sortBy`: "createdAt" | "name" | "email" | "status"
  - `sortOrder`: "asc" | "desc"

**Response Data**:
```json
{
  "data": [
    {
      "id": "user-123",
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "email": "rajesh@example.com",
      "phone": "+91-9876543210",
      "role": "OWNER",
      "status": "ACTIVE",
      "createdAt": "2025-01-15T10:30:00Z",
      "propertiesCount": 5,
      "bookingsAsGuestCount": 2,
      "bookingsAsOwnerCount": 12,
      "inquiriesCount": 3,
      "reviewsCount": 8,
      "totalBookings": 14
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "pages": 15
  }
}
```

#### PATCH `/api/admin/users`
Update user status
- **Body**:
```json
{
  "userId": "user-123",
  "status": "SUSPENDED"
}
```
- **Valid Status Values**: ACTIVE, INACTIVE, SUSPENDED, PENDING

---

### 🏠 Admin Properties Management

#### GET `/api/admin/properties`
Get all properties with filters
- **Query Params**:
  - `page`, `pageSize`
  - `status`: "ACTIVE" | "INACTIVE" | "PENDING_REVIEW" | etc.
  - `propertyType`: "APARTMENT" | "VILLA" | "HOUSE" | etc.
  - `city`: Filter by city name
  - `ownerId`: Filter by owner ID
  - `minPrice` / `maxPrice`: Price range filter
  - `search`: Search by title or address
  - `sortBy`: "createdAt" | "price" | "title" | "rating"
  - `sortOrder`: "asc" | "desc"

**Response Data**:
```json
{
  "data": [
    {
      "id": "prop-123",
      "title": "2BHK Apartment in Bangalore",
      "address": "123 Main St",
      "city": "Bangalore",
      "state": "Karnataka",
      "propertyType": "APARTMENT",
      "status": "ACTIVE",
      "price": 25000,
      "bedrooms": 2,
      "bathrooms": 2,
      "ownerId": "owner-123",
      "ownerName": "Rajesh Kumar",
      "avgRating": 4.5,
      "reviewsCount": 8,
      "bookingsCount": 12,
      "images": [{ "id": "img-1", "imageUrl": "...", "isPrimary": true }],
      "createdAt": "2024-11-20T10:30:00Z"
    }
  ]
}
```

#### PATCH `/api/admin/properties`
Update property status
- **Body**:
```json
{
  "propertyId": "prop-123",
  "status": "ACTIVE",
  "notes": "Approved after review"
}
```
- **Valid Status Values**: DRAFT, PENDING_REVIEW, ACTIVE, INACTIVE, SOLD, RENTED, MAINTENANCE

---

### 📅 Admin Bookings Management

#### GET `/api/admin/bookings`
Get all bookings with advanced filters
- **Query Params**:
  - `page`, `pageSize`
  - `status`: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "CHECKED_IN" | "CHECKED_OUT"
  - `paymentStatus`: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  - `propertyId`: Filter by property
  - `guestId`: Filter by guest
  - `ownerId`: Filter by property owner
  - `from` / `to`: Date range filter
  - `searchTerm`: Search by booking ID, property title, or guest name
  - `sortBy`: "createdAt" | "checkIn" | "amount" | "status"
  - `sortOrder`: "asc" | "desc"

**Response Data**:
```json
{
  "data": [
    {
      "id": "booking-123",
      "propertyId": "prop-123",
      "propertyTitle": "2BHK Apartment",
      "guestId": "guest-123",
      "guestName": "Priya Singh",
      "guestEmail": "priya@example.com",
      "guestPhone": "+91-9876543211",
      "checkInDate": "2025-03-10",
      "checkOutDate": "2025-03-15",
      "nights": 5,
      "numberOfGuests": 2,
      "basePrice": 25000,
      "cleaningFee": 500,
      "serviceFee": 1250,
      "totalAmount": 128500,
      "paidAmount": 128500,
      "balanceAmount": 0,
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "UPI",
      "createdAt": "2025-02-28T10:30:00Z"
    }
  ]
}
```

#### PATCH `/api/admin/bookings`
Update booking status
- **Body**:
```json
{
  "bookingId": "booking-123",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "notes": "Manual payment verification done"
}
```

---

### 💳 Admin Payments Management

#### GET `/api/admin/payments`
Get all payments with filters
- **Query Params**:
  - `page`, `pageSize`
  - `status`: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIAL"
  - `paymentMethod`: "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING" | "CASH" | "WALLET"
  - `from` / `to`: Date range filter
  - `userId`: Filter by user
  - `bookingId`: Filter by booking
  - `search`: Search by transaction ID or user name
  - `sortBy`: "createdAt" | "amount" | "status" | "method"
  - `sortOrder`: "asc" | "desc"

**Response Data**:
```json
{
  "data": {
    "payments": [
      {
        "id": "payment-123",
        "transactionId": "TXN20250215001",
        "userId": "user-123",
        "userName": "Priya Singh",
        "userEmail": "priya@example.com",
        "bookingId": "booking-123",
        "propertyTitle": "2BHK Apartment",
        "amount": 125000,
        "currency": "INR",
        "status": "PAID",
        "paymentMethod": "UPI",
        "razorpayOrderId": "order-123",
        "razorpayPaymentId": "pay-123",
        "createdAt": "2025-02-15T10:30:00Z"
      }
    ],
    "stats": {
      "totalPayments": 500,
      "totalAmount": 5000000,
      "completedAmount": 4900000,
      "pendingAmount": 100000
    }
  }
}
```

#### PATCH `/api/admin/payments`
Update payment status
- **Body**:
```json
{
  "paymentId": "payment-123",
  "status": "REFUNDED",
  "notes": "Customer requested refund"
}
```

---

### 🏢 Admin Owners Management

#### GET `/api/admin/owners`
Get all property owners
- **Query Params**:
  - `page`, `pageSize`
  - `status`: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
  - `verified`: "true" | "false" (filter by verification)
  - `search`: Search by name, email, or phone
  - `sortBy`: "createdAt" | "name" | "email" | "properties"
  - `sortOrder`: "asc" | "desc"

**Response Data**:
```json
{
  "data": [
    {
      "id": "owner-123",
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "email": "rajesh@example.com",
      "phone": "+91-9876543210",
      "status": "ACTIVE",
      "totalProperties": 5,
      "activeProperties": 4,
      "totalBookings": 12,
      "properties": [
        { "id": "prop-1", "title": "2BHK Apartment", "status": "ACTIVE", "price": 25000 }
      ],
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### PATCH `/api/admin/owners`
Update owner status
- **Body**:
```json
{
  "userId": "owner-123",
  "status": "SUSPENDED",
  "notes": "Violation of platform policies"
}
```

---

### 🔧 Admin Service Providers Management

#### GET `/api/admin/service-providers`
Get all service providers
- **Query Params**:
  - `page`, `pageSize`
  - `status`: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
  - `verified`: "true" | "false"
  - `search`: Search by name, company, or email
  - `sortBy`: "createdAt" | "name" | "rating"
  - `sortOrder`: "asc" | "desc"

**Response Data**:
```json
{
  "data": [
    {
      "id": "provider-123",
      "firstName": "Amit",
      "lastName": "Patel",
      "email": "amit@example.com",
      "phone": "+91-9876543212",
      "status": "ACTIVE",
      "verified": true,
      "companyName": "ABC Plumbing Services",
      "description": "Professional plumbing services",
      "serviceCategories": ["PLUMBING", "ELECTRICAL"],
      "avgRating": 4.7,
      "totalReviews": 45,
      "totalRequests": 120,
      "totalBookings": 95,
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
}
```

#### PATCH `/api/admin/service-providers`
Update service provider status or verification
- **Body**:
```json
{
  "userId": "provider-123",
  "status": "ACTIVE",
  "verified": true,
  "notes": "Documents verified"
}
```

---

### ❓ Admin Inquiries Management

#### GET `/api/admin/inquiries`
Get all inquiries
- **Query Params**:
  - `page`, `pageSize`
  - `status`: "NEW" | "READ" | "REPLIED" | "CLOSED" | "CONVERTED"
  - `propertyId`: Filter by property
  - `from` / `to`: Date range filter
  - `search`: Search by email, message, or property title
  - `sortBy`: "createdAt" | "status" | "email"
  - `sortOrder`: "asc" | "desc"

**Response Data**:
```json
{
  "data": [
    {
      "id": "inquiry-123",
      "userId": "user-123",
      "userName": "Priya Singh",
      "userEmail": "priya@example.com",
      "phone": "+91-9876543211",
      "propertyId": "prop-123",
      "propertyTitle": "2BHK Apartment",
      "message": "Is the property available in March?",
      "status": "NEW",
      "createdAt": "2025-02-28T10:30:00Z"
    }
  ]
}
```

#### PATCH `/api/admin/inquiries`
Update inquiry status or add reply
- **Body**:
```json
{
  "inquiryId": "inquiry-123",
  "status": "REPLIED",
  "reply": "Yes, the property is available from March 1st onwards.",
  "notes": "Contacted owner for confirmation"
}
```

---

## Usage Examples

### Example 1: Get Admin Dashboard Stats
```javascript
fetch('/api/admin/stats', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data.data))
```

### Example 2: Get Paginated Users
```javascript
fetch('/api/admin/users?page=1&pageSize=20&role=OWNER&status=ACTIVE&sortBy=name&sortOrder=asc', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
.then(res => res.json())
```

### Example 3: Update User Status
```javascript
fetch('/api/admin/users', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user-123',
    status: 'SUSPENDED'
  })
})
```

### Example 4: Generate Revenue Report
```javascript
fetch('/api/admin/stats?type=revenue&period=month', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
```

---

## Best Practices

1. **Always include proper error handling** in your frontend
2. **Use pagination** for large datasets to avoid performance issues
3. **Implement proper filtering** on the backend to reduce data transfer
4. **Cache responses appropriately** using browser caching headers
5. **Validate user input** before making API calls
6. **Monitor API performance** and optimize slow queries
7. **Use appropriate HTTP methods**: GET for retrieval, PATCH for updates
8. **Log all admin actions** for audit purposes

---

## Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Architecture Overview

```
/api/admin/
├── users/              # User management
├── bookings/          # Booking management
├── properties/        # Property management
├── payments/          # Payment management
├── owners/            # Owner profiles
├── service-providers/ # Service provider management
├── inquiries/         # Inquiry management
└── stats/             # Dashboard stats & reports
```

All endpoints:
- ✅ Use JWT authentication via `withAuth` middleware
- ✅ Require ADMIN role
- ✅ Support pagination and filtering
- ✅ Return standardized response format
- ✅ Include comprehensive error handling
- ✅ Follow REST conventions

---

## Integration with Admin Dashboard

The admin dashboard components at `/src/app/admin/dashboard/` can be updated to fetch data from these APIs:

```tsx
// Example: Fetch users in admin dashboard
useEffect(() => {
  fetch(`/api/admin/users?page=${page}&pageSize=${pageSize}&role=${filters.role}`)
    .then(res => res.json())
    .then(data => setUsers(data.data))
}, [page, filters])
```

---

## Support & Troubleshooting

If you encounter issues:
1. Check that you have ADMIN role in your JWT token
2. Verify the JWT token is not expired
3. Check network tab for actual API response
4. Review server logs for detailed error messages
5. Ensure required query parameters are provided
