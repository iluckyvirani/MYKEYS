# Reviews API Testing Guide

## Prerequisites

Before testing, you need to:

1. **Start your PostgreSQL database**
2. **Apply the migration:**
   ```bash
   npx prisma migrate dev --name add_review_enhancements
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Quick Test Commands (PowerShell)

### 1. Create a Review (Authenticated)

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
$body = @{
    rating = 5
    comment = "Amazing property! Very clean and great location."
    propertyId = "YOUR_PROPERTY_ID"
    bookingId = "YOUR_BOOKING_ID"
    cleanlinessRating = 5
    communicationRating = 5
    accuracyRating = 5
    locationRating = 5
    valueRating = 4
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reviews" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
    -Body $body
```

### 2. Get All Reviews

```powershell
# Get all reviews
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews" -Method GET

# Get reviews with filters
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews?page=1&limit=10&sortBy=rating&sortOrder=desc" -Method GET
```

### 3. Get Reviews by Property

```powershell
$propertyId = "YOUR_PROPERTY_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/property/$propertyId" -Method GET
```

### 4. Get Property Statistics

```powershell
$propertyId = "YOUR_PROPERTY_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/property/$propertyId/stats" -Method GET
```

### 5. Get Reviews by User

```powershell
$userId = "YOUR_USER_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/user/$userId" -Method GET
```

### 6. Get Single Review

```powershell
$reviewId = "YOUR_REVIEW_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId" -Method GET
```

### 7. Update Review (Authenticated)

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
$reviewId = "YOUR_REVIEW_ID"
$body = @{
    rating = 4
    comment = "Updated review: Still great but adjusting rating"
    cleanlinessRating = 4
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId" `
    -Method PATCH `
    -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
    -Body $body
```

### 8. Owner Response (Authenticated as Owner)

```powershell
$ownerToken = "OWNER_ACCESS_TOKEN_HERE"
$reviewId = "YOUR_REVIEW_ID"
$body = @{
    response = "Thank you for your wonderful review! We're thrilled you enjoyed your stay."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId/response" `
    -Method POST `
    -Headers @{ "Authorization" = "Bearer $ownerToken"; "Content-Type" = "application/json" } `
    -Body $body
```

### 9. Mark Review as Helpful

```powershell
$reviewId = "YOUR_REVIEW_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId/helpful" -Method POST
```

### 10. Report Review

```powershell
$reviewId = "YOUR_REVIEW_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId/report" -Method POST
```

### 11. Check Review Eligibility (Authenticated)

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
$propertyId = "YOUR_PROPERTY_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/can-review/$propertyId" `
    -Method GET `
    -Headers @{ "Authorization" = "Bearer $token" }
```

### 12. Delete Review (Authenticated)

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
$reviewId = "YOUR_REVIEW_ID"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId" `
    -Method DELETE `
    -Headers @{ "Authorization" = "Bearer $token" }
```

---

## Testing Flow

### Scenario 1: Guest Reviews a Property After Booking

1. **Guest completes a booking**
2. **Check if can review:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/can-review/$propertyId" `
       -Method GET -Headers @{ "Authorization" = "Bearer $guestToken" }
   ```
3. **Create review:**
   ```powershell
   $body = @{
       rating = 5
       comment = "Excellent stay!"
       propertyId = $propertyId
       bookingId = $bookingId
       cleanlinessRating = 5
       communicationRating = 5
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:3000/api/reviews" `
       -Method POST `
       -Headers @{ "Authorization" = "Bearer $guestToken"; "Content-Type" = "application/json" } `
       -Body $body
   ```

### Scenario 2: Owner Responds to Review

1. **Owner gets notifications of new review**
2. **Owner views review**
3. **Owner adds response:**
   ```powershell
   $body = @{ response = "Thank you!" } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId/response" `
       -Method POST `
       -Headers @{ "Authorization" = "Bearer $ownerToken"; "Content-Type" = "application/json" } `
       -Body $body
   ```

### Scenario 3: Users Browse Reviews

1. **Get property reviews:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/property/$propertyId?isVerified=true&sortBy=helpfulCount&sortOrder=desc"
   ```
2. **View property stats:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/property/$propertyId/stats"
   ```
3. **Mark helpful reviews:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$reviewId/helpful" -Method POST
   ```

---

## Expected Responses

### Success Response (Create Review):
```json
{
  "id": "clx...",
  "rating": 5,
  "comment": "Amazing property!",
  "isVerified": true,
  "helpfulCount": 0,
  "reportCount": 0,
  "property": {
    "id": "...",
    "title": "Beautiful Villa",
    "city": "London"
  },
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "..."
  },
  "createdAt": "2026-02-10T..."
}
```

### Statistics Response:
```json
{
  "averageRating": 4.7,
  "totalReviews": 42,
  "ratingDistribution": {
    "1": 0,
    "2": 1,
    "3": 4,
    "4": 12,
    "5": 25
  },
  "detailedRatings": {
    "cleanliness": 4.8,
    "communication": 4.9,
    "accuracy": 4.6,
    "location": 4.8,
    "value": 4.5
  }
}
```

### Paginated Response:
```json
{
  "reviews": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## Common Errors

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Solution:** Provide a valid access token in the Authorization header.

### 400 Bad Request
```json
{
  "error": "Rating must be between 1 and 5"
}
```
**Solution:** Ensure rating values are in the valid range.

### 403 Forbidden
```json
{
  "error": "You can only update your own reviews"
}
```
**Solution:** Users can only modify their own reviews; owners can only respond to reviews of their properties.

### 404 Not Found
```json
{
  "error": "Review not found"
}
```
**Solution:** Check that the review ID is correct.

---

## Validation Rules

1. **Rating:** Must be between 1 and 5
2. **Detailed Ratings:** All must be between 1 and 5 if provided
3. **One Review Per Booking:** A user can only review a booking once
4. **Verified Reviews:** Only reviews from completed bookings are marked as verified
5. **Owner Response:** Only property owners can respond to reviews of their properties
6. **Update/Delete:** Users can only modify their own reviews

---

## Database Migration Note

⚠️ **Important:** The schema changes won't be reflected in the database until you run:

```bash
npx prisma migrate dev --name add_review_enhancements
```

This will:
- Add `cleanlinessRating`, `communicationRating`, `accuracyRating`, `locationRating`, `valueRating` fields
- Add `isVerified`, `helpfulCount`, `reportCount` fields
- Create indexes on `rating` and `isVerified` for better query performance

---

## Performance Tips

1. **Use pagination** for large result sets
2. **Filter by isVerified=true** to show only verified reviews
3. **Sort by helpfulCount** to show most helpful reviews first
4. **Cache property statistics** as they don't change frequently
5. **Load reviews incrementally** on property detail pages

---

## Integration with Frontend

### Display Average Rating
```javascript
const response = await fetch(`/api/reviews/property/${propertyId}/stats`);
const stats = await response.json();
console.log(`★ ${stats.averageRating} (${stats.totalReviews} reviews)`);
```

### Load Reviews with Infinite Scroll
```javascript
let page = 1;
const loadMoreReviews = async () => {
  const response = await fetch(
    `/api/reviews/property/${propertyId}?page=${page}&limit=10&sortBy=createdAt`
  );
  const { reviews, pagination } = await response.json();
  // Append reviews to UI
  page++;
};
```

### Check Before Showing Review Form
```javascript
const response = await fetch(`/api/reviews/can-review/${propertyId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { canReview } = await response.json();
if (canReview) {
  showReviewForm();
}
```
