# Reviews API Documentation

## Overview
Comprehensive review system API with rating statistics, owner responses, and user verification.

## API Endpoints

### 1. Create Review
**POST** `/api/reviews`

Create a new review for a property (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Amazing property! Great location and very clean.",
  "propertyId": "prop_123",
  "bookingId": "booking_456",
  "cleanlinessRating": 5,
  "communicationRating": 5,
  "accuracyRating": 5,
  "locationRating": 5,
  "valueRating": 5
}
```

**Response:** `201 Created`
```json
{
  "id": "review_789",
  "rating": 5,
  "comment": "Amazing property!...",
  "isVerified": true,
  "helpfulCount": 0,
  "reportCount": 0,
  "property": {...},
  "user": {...},
  "createdAt": "2026-02-10T10:00:00Z"
}
```

---

### 2. Get All Reviews
**GET** `/api/reviews`

Get all reviews with optional filtering and pagination.

**Query Parameters:**
- `propertyId` (optional): Filter by property
- `userId` (optional): Filter by user
- `bookingId` (optional): Filter by booking
- `minRating` (optional): Minimum rating (1-5)
- `maxRating` (optional): Maximum rating (1-5)
- `isVerified` (optional): Filter verified reviews (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): rating | createdAt | helpfulCount (default: createdAt)
- `sortOrder` (optional): asc | desc (default: desc)

**Example:**
```
GET /api/reviews?propertyId=prop_123&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Response:** `200 OK`
```json
{
  "reviews": [
    {
      "id": "review_789",
      "rating": 5,
      "comment": "Amazing property!",
      "property": {...},
      "user": {...},
      "createdAt": "2026-02-10T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 3. Get Single Review
**GET** `/api/reviews/:id`

Get a specific review by ID.

**Response:** `200 OK`
```json
{
  "id": "review_789",
  "rating": 5,
  "comment": "Amazing property!",
  "response": "Thank you for your kind words!",
  "isVerified": true,
  "helpfulCount": 12,
  "property": {...},
  "user": {...},
  "booking": {...},
  "createdAt": "2026-02-10T10:00:00Z",
  "respondedAt": "2026-02-10T12:00:00Z"
}
```

---

### 4. Update Review
**PATCH** `/api/reviews/:id`

Update a review (user can only update their own reviews).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review text",
  "cleanlinessRating": 4
}
```

**Response:** `200 OK`

---

### 5. Delete Review
**DELETE** `/api/reviews/:id`

Delete a review (user can only delete their own reviews).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Review deleted successfully",
  "review": {...}
}
```

---

### 6. Get Reviews by Property
**GET** `/api/reviews/property/:propertyId`

Get all reviews for a specific property.

**Query Parameters:** Same as "Get All Reviews"

**Example:**
```
GET /api/reviews/property/prop_123?page=1&limit=5&minRating=4
```

**Response:** Same as "Get All Reviews"

---

### 7. Get Property Rating Statistics
**GET** `/api/reviews/property/:propertyId/stats`

Get comprehensive rating statistics for a property.

**Response:** `200 OK`
```json
{
  "averageRating": 4.6,
  "totalReviews": 48,
  "ratingDistribution": {
    "1": 0,
    "2": 2,
    "3": 5,
    "4": 15,
    "5": 26
  },
  "detailedRatings": {
    "cleanliness": 4.8,
    "communication": 4.7,
    "accuracy": 4.6,
    "location": 4.9,
    "value": 4.5
  }
}
```

---

### 8. Get Reviews by User
**GET** `/api/reviews/user/:userId`

Get all reviews written by a specific user.

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder`

**Response:** Same as "Get All Reviews"

---

### 9. Add Owner Response
**POST** `/api/reviews/:id/response`

Owner adds a response to a review (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "response": "Thank you for your feedback! We're glad you enjoyed your stay."
}
```

**Response:** `200 OK`
```json
{
  "id": "review_789",
  "rating": 5,
  "comment": "Great place!",
  "response": "Thank you for your feedback!...",
  "respondedAt": "2026-02-10T12:00:00Z",
  "property": {...},
  "user": {...}
}
```

---

### 10. Mark Review as Helpful
**POST** `/api/reviews/:id/helpful`

Increment the helpful count for a review.

**Response:** `200 OK`
```json
{
  "id": "review_789",
  "helpfulCount": 13,
  ...
}
```

---

### 11. Report Review
**POST** `/api/reviews/:id/report`

Report a review as inappropriate.

**Response:** `200 OK`
```json
{
  "message": "Review reported successfully",
  "review": {...}
}
```

---

### 12. Check Review Eligibility
**GET** `/api/reviews/can-review/:propertyId`

Check if the authenticated user can review a property (has completed booking without existing review).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "canReview": true
}
```

---

## Schema Enhancements

### Review Model
```prisma
model Review {
  id       String  @id @default(cuid())
  rating   Int     // Range: 1-5
  comment  String?
  response String?

  // Rating breakdown (optional detailed ratings)
  cleanlinessRating   Int? // 1-5
  communicationRating Int? // 1-5
  accuracyRating      Int? // 1-5
  locationRating      Int? // 1-5
  valueRating         Int? // 1-5

  // Status & Verification
  isVerified   Boolean @default(false) // Review from actual booking
  helpfulCount Int     @default(0)
  reportCount  Int     @default(0)

  // Relations
  propertyId String
  property   Property @relation(...)
  userId     String
  user       User     @relation(...)
  bookingId  String?  @unique
  booking    Booking? @relation(...)

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  respondedAt DateTime?

  // Indexes
  @@index([propertyId])
  @@index([userId])
  @@index([rating])
  @@index([isVerified])
}
```

---

## Usage Examples

### Example 1: Create a Review (After Booking Completion)
```javascript
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    rating: 5,
    comment: 'Fantastic stay! The property exceeded expectations.',
    propertyId: 'prop_abc123',
    bookingId: 'booking_xyz789',
    cleanlinessRating: 5,
    communicationRating: 5,
    accuracyRating: 5,
    locationRating: 5,
    valueRating: 5
  })
});

const review = await response.json();
```

### Example 2: Get Property Reviews with Pagination
```javascript
const response = await fetch(
  '/api/reviews/property/prop_abc123?page=1&limit=10&sortBy=helpfulCount&sortOrder=desc'
);
const { reviews, pagination } = await response.json();
```

### Example 3: Owner Responds to Review
```javascript
const response = await fetch('/api/reviews/review_789/response', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ownerToken}`
  },
  body: JSON.stringify({
    response: 'Thank you for your wonderful review! Hope to host you again soon.'
  })
});
```

### Example 4: Get Property Statistics
```javascript
const response = await fetch('/api/reviews/property/prop_abc123/stats');
const stats = await response.json();

console.log(`Average Rating: ${stats.averageRating}/5`);
console.log(`Total Reviews: ${stats.totalReviews}`);
console.log(`5-star reviews: ${stats.ratingDistribution[5]}`);
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Rating must be between 1 and 5"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Review not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create review"
}
```

---

## Features Implemented

✅ Full CRUD operations for reviews
✅ Detailed rating breakdown (cleanliness, communication, accuracy, location, value)
✅ Verified reviews (from actual completed bookings)
✅ Owner response functionality
✅ Helpful count tracking
✅ Report inappropriate reviews
✅ Comprehensive filtering and pagination
✅ Property rating statistics
✅ Review eligibility checking
✅ User and property-specific review queries
✅ Authentication and authorization
✅ Validation for ratings and permissions

---

## Next Steps for Database

When the database is running, apply the migration:

```bash
npx prisma migrate dev --name add_review_enhancements
```

This will add the new fields to the Review table:
- cleanlinessRating
- communicationRating
- accuracyRating
- locationRating
- valueRating
- isVerified
- helpfulCount
- reportCount
- Additional indexes for better query performance
