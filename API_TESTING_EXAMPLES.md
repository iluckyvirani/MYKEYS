# API Testing Examples

## Amenities API

### 1. Create Amenity (POST)
```bash
curl -X POST http://localhost:3000/api/amenities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "WiFi",
    "category": "Connectivity",
    "icon": "Wifi"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Amenity created successfully",
  "data": {
    "id": "amenity-001",
    "name": "WiFi",
    "category": "Connectivity",
    "icon": "Wifi",
    "createdAt": "2025-01-31T16:14:14.000Z"
  },
  "statusCode": 201
}
```

### 2. Get All Amenities (GET)
```bash
# Get all amenities
curl http://localhost:3000/api/amenities

# With filters
curl "http://localhost:3000/api/amenities?category=Connectivity&search=WiFi&page=1&pageSize=10"
```

**Response:**
```json
{
  "success": true,
  "message": "Amenities retrieved successfully",
  "data": [
    {
      "id": "amenity-001",
      "name": "WiFi",
      "category": "Connectivity",
      "icon": "Wifi",
      "propertyCount": 45,
      "createdAt": "2025-01-31T16:14:14.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  },
  "statusCode": 200
}
```

### 3. Get Single Amenity (GET)
```bash
curl http://localhost:3000/api/amenities/amenity-001
```

### 4. Update Amenity (PUT)
```bash
curl -X PUT http://localhost:3000/api/amenities/amenity-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "High-Speed WiFi",
    "category": "Connectivity"
  }'
```

### 5. Delete Amenity (DELETE)
```bash
curl -X DELETE http://localhost:3000/api/amenities/amenity-001 \
  -H "Authorization: Bearer <admin-token>"
```

---

## Properties API

### 1. Create Property with Amenities (POST)
```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <owner-token>" \
  -d '{
    "title": "Modern Luxury Apartment in Canary Wharf",
    "description": "Stunning modern apartment with panoramic views...",
    "address": "25 Harbour Exchange Square, Canary Wharf",
    "city": "London",
    "state": "England",
    "country": "UK",
    "zipCode": "E14 9GE",
    "latitude": 51.5033,
    "longitude": -0.0187,
    "price": 2800,
    "priceType": "NIGHTLY",
    "originalPrice": 3000,
    "propertyType": "APARTMENT",
    "listingType": "RENT",
    "rentalType": "SHORT_TERM",
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1200,
    "guests": 4,
    "minStay": 2,
    "maxStay": 30,
    "parking": 1,
    "occupancy": 85,
    "revenue": 540000,
    "cleaningFee": 150,
    "serviceFee": 85,
    "securityDeposit": 3360,
    "amenities": ["amenity-001", "amenity-002", "amenity-003"],
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
        "caption": "Main bedroom",
        "isPrimary": true
      },
      {
        "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        "caption": "Living room"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": "prop-001",
    "title": "Modern Luxury Apartment in Canary Wharf",
    "slug": "modern-luxury-apartment-in-canary-wharf-1738327620000",
    "address": "25 Harbour Exchange Square, Canary Wharf",
    "city": "London",
    "price": 2800,
    "priceType": "NIGHTLY",
    "originalPrice": 3000,
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1200,
    "guests": 4,
    "occupancy": 85,
    "revenue": 540000,
    "status": "DRAFT",
    "views": 0,
    "saves": 0,
    "images": [
      {
        "id": "img-001",
        "url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
        "isPrimary": true
      }
    ],
    "amenities": [
      {
        "id": "pa-001",
        "amenityId": "amenity-001",
        "amenity": {
          "id": "amenity-001",
          "name": "WiFi",
          "category": "Connectivity",
          "icon": "Wifi"
        }
      }
    ]
  },
  "statusCode": 201
}
```

### 2. Get Property (GET)
```bash
curl http://localhost:3000/api/properties/prop-001
```

### 3. Update Property (PATCH)
```bash
curl -X PATCH http://localhost:3000/api/properties/prop-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <owner-token>" \
  -d '{
    "occupancy": 92,
    "revenue": 580000,
    "price": 2900,
    "originalPrice": 3100
  }'
```

### 4. Delete Property (DELETE)
```bash
curl -X DELETE http://localhost:3000/api/properties/prop-001 \
  -H "Authorization: Bearer <owner-token>"
```

### 5. Get Properties with Filters (GET)
```bash
curl "http://localhost:3000/api/properties?city=London&propertyType=APARTMENT&minPrice=1000&maxPrice=5000&page=1&pageSize=10"
```

---

## Owner Dashboard - Getting Property Stats

### Fetch Properties with Stats for Dashboard
```bash
curl "http://localhost:3000/api/properties?status=ACTIVE&page=1&pageSize=50"
```

**Fields available for PropertyList.tsx:**
- `id` - Property ID
- `title` - Property name
- `address` - Location
- `propertyType` - Type (APARTMENT, VILLA, etc.)
- `status` - Status (ACTIVE, INACTIVE, MAINTENANCE, PENDING)
- `price` - Price amount
- `priceType` - Price type (NIGHTLY, MONTHLY, TOTAL)
- `occupancy` - Occupancy percentage (0-100) ← Used in PropertyList
- `revenue` - Monthly revenue ← Used in PropertyList
- `views` - Total views ← Already existed
- `averageRating` - Calculated from reviews
- `reviewCount` - Number of reviews
- `images` - Array of property images
- `amenities` - Related amenities via PropertyAmenity
- `owner` - Owner details

---

## Favorites API

The Favorites API allows users to manage their favorite properties with add, remove, toggle, and list operations.

### 1. Get User's Favorite Properties (GET)
**Endpoint:** `GET /api/favorites`

Retrieve all favorite properties for the authenticated user with pagination and rating calculations.

```bash
# Get all favorites (default: page 1, pageSize 10)
curl http://localhost:3000/api/favorites \
  -H "Authorization: Bearer <user-token>"

# With pagination
curl "http://localhost:3000/api/favorites?page=2&pageSize=20" \
  -H "Authorization: Bearer <user-token>"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Favorites retrieved successfully",
  "data": {
    "items": [
      {
        "id": "fav_clxyz123abc",
        "userId": "user_clxyz456def",
        "propertyId": "prop-001",
        "createdAt": "2026-02-02T10:30:00.000Z",
        "property": {
          "id": "prop-001",
          "title": "Modern Luxury Apartment in Canary Wharf",
          "slug": "modern-luxury-apartment-canary-wharf",
          "description": "Stunning modern apartment with panoramic views",
          "address": "25 Harbour Exchange, London E14",
          "city": "London",
          "state": "England",
          "country": "United Kingdom",
          "zipCode": "E14 9RR",
          "latitude": 51.5048,
          "longitude": -0.0191,
          "propertyType": "Apartment",
          "listingType": "buy",
          "price": 850000,
          "priceType": "total",
          "bedrooms": 3,
          "bathrooms": 2,
          "sqft": 1200,
          "guests": 4,
          "minStay": 1,
          "maxStay": null,
          "status": "ACTIVE",
          "isFeatured": true,
          "averageRating": 4.8,
          "reviewCount": 24,
          "images": [
            {
              "id": "img_001",
              "url": "https://images.unsplash.com/...",
              "caption": "Living Room",
              "isPrimary": true,
              "order": 1
            }
          ],
          "amenities": [
            {
              "id": "am_001",
              "amenity": {
                "id": "a_001",
                "name": "WiFi",
                "icon": "wifi",
                "category": "Connectivity"
              }
            }
          ],
          "owner": {
            "id": "owner_001",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "phone": "+44123456789",
            "avatar": "https://..."
          }
        }
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

**Error Response (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

### 2. Add Property to Favorites (POST)
**Endpoint:** `POST /api/favorites/add`

Add a property to the user's favorites list. Increments the property's save count.

```bash
curl -X POST http://localhost:3000/api/favorites/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-token>" \
  -d '{
    "propertyId": "prop-001"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Property added to favorites successfully",
  "data": {
    "id": "fav_clxyz123abc",
    "userId": "user_clxyz456def",
    "propertyId": "prop-001",
    "createdAt": "2026-02-02T10:30:00.000Z"
  }
}
```

**Error Response (Already Favorited - 400):**
```json
{
  "success": false,
  "message": "Property already in favorites",
  "code": "ALREADY_FAVORITED"
}
```

**Error Response (Property Not Found - 404):**
```json
{
  "success": false,
  "message": "Property not found",
  "code": "PROPERTY_NOT_FOUND"
}
```

**Error Response (Missing Property ID - 400):**
```json
{
  "success": false,
  "message": "Property ID is required",
  "code": "MISSING_PROPERTY_ID"
}
```

### 3. Remove Property from Favorites (DELETE)
**Endpoint:** `DELETE /api/favorites/remove`

Remove a property from the user's favorites list. Decrements the property's save count.

```bash
curl -X DELETE http://localhost:3000/api/favorites/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-token>" \
  -d '{
    "propertyId": "prop-001"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Property removed from favorites successfully",
  "data": null
}
```

**Error Response (Not Favorited - 404):**
```json
{
  "success": false,
  "message": "Favorite not found",
  "code": "FAVORITE_NOT_FOUND"
}
```

**Error Response (Missing Property ID - 400):**
```json
{
  "success": false,
  "message": "Property ID is required",
  "code": "MISSING_PROPERTY_ID"
}
```

### 4. Toggle Favorite Status (POST)
**Endpoint:** `POST /api/favorites/toggle`

Toggle the favorite status of a property. Adds to favorites if not already favorited, removes if already favorited.

```bash
curl -X POST http://localhost:3000/api/favorites/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-token>" \
  -d '{
    "propertyId": "prop-001"
  }'
```

**Response (Added to Favorites - 200):**
```json
{
  "success": true,
  "message": "Property added to favorites successfully",
  "data": {
    "action": "added",
    "favorite": {
      "id": "fav_clxyz123abc",
      "userId": "user_clxyz456def",
      "propertyId": "prop-001",
      "createdAt": "2026-02-02T10:30:00.000Z"
    }
  }
}
```

**Response (Removed from Favorites - 200):**
```json
{
  "success": true,
  "message": "Property removed from favorites successfully",
  "data": {
    "action": "removed",
    "favorite": null
  }
}
```

**Error Response (Property Not Found - 404):**
```json
{
  "success": false,
  "message": "Property not found",
  "code": "PROPERTY_NOT_FOUND"
}
```

**Error Response (Missing Property ID - 400):**
```json
{
  "success": false,
  "message": "Property ID is required",
  "code": "MISSING_PROPERTY_ID"
}
```

---

curl -X DELETE http://localhost:3000/api/favorites/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-token>" \
  -d '{
    "propertyId": "prop-001"
  }'

---

## Bookings API

### 1. Create Booking (POST)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <guest-token>" \
  -d '{
    "propertyId": "PROP-123",
    "checkInDate": "2026-02-10",
    "checkOutDate": "2026-02-15",
    "numberOfGuests": 2,
    "paymentMethod": "CREDIT_CARD",
    "specialRequests": "Extra pillows please"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "BOOK-1706476800000",
    "bookingType": "SHORT_TERM",
    "propertyId": "PROP-123",
    "propertyTitle": "Sample Property",
    "guestId": "USER-456",
    "guestName": "Guest Name",
    "guestEmail": "guest@example.com",
    "guestPhone": "",
    "checkInDate": "2026-02-10",
    "checkOutDate": "2026-02-15",
    "numberOfNights": 5,
    "numberOfGuests": 2,
    "pricePerNight": 100,
    "totalNights": 5,
    "subtotal": 500,
    "cleaningFee": 50,
    "serviceFee": 25,
    "totalAmount": 575,
    "paymentStatus": "PENDING",
    "paymentMethod": "CREDIT_CARD",
    "paidAmount": 0,
    "balanceAmount": 575,
    "status": "PENDING",
    "specialRequests": "Extra pillows please",
    "ownerId": "OWNER-1",
    "createdAt": "2026-02-05T10:00:00.000Z",
    "updatedAt": "2026-02-05T10:00:00.000Z"
  }
}
```

### 2. Get All Bookings (GET)
```bash
# Get all bookings
curl http://localhost:3000/api/bookings \
  -H "Authorization: Bearer <user-token>"

# With filters
curl "http://localhost:3000/api/bookings?propertyId=PROP-123&status=CONFIRMED&page=1&pageSize=10" \
  -H "Authorization: Bearer <user-token>"

# Filter by date range
curl "http://localhost:3000/api/bookings?from=2026-02-01&to=2026-02-28&page=1" \
  -H "Authorization: Bearer <user-token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "items": [
      {
        "id": "BOOK-1706476800000",
        "bookingType": "SHORT_TERM",
        "propertyId": "PROP-123",
        "guestId": "USER-456",
        "checkInDate": "2026-02-10",
        "checkOutDate": "2026-02-15",
        "numberOfNights": 5,
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "totalAmount": 575,
        "createdAt": "2026-02-05T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 3. Get Booking by ID (GET)
```bash
curl http://localhost:3000/api/bookings/BOOK-1706476800000 \
  -H "Authorization: Bearer <user-token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "id": "BOOK-1706476800000",
    "bookingType": "SHORT_TERM",
    "propertyId": "PROP-123",
    "propertyTitle": "Sample Property",
    "guestId": "USER-456",
    "guestName": "Guest Name",
    "guestEmail": "guest@example.com",
    "checkInDate": "2026-02-10",
    "checkOutDate": "2026-02-15",
    "numberOfNights": 5,
    "numberOfGuests": 2,
    "pricePerNight": 100,
    "totalAmount": 575,
    "paymentStatus": "PAID",
    "status": "CONFIRMED",
    "specialRequests": "Extra pillows please",
    "createdAt": "2026-02-05T10:00:00.000Z",
    "updatedAt": "2026-02-05T10:00:00.000Z"
  }
}
```

### 4. Update Booking Status (PATCH)
```bash
# Owner confirms/cancels booking
curl -X PATCH http://localhost:3000/api/bookings/BOOK-1706476800000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <owner-token>" \
  -d '{
    "status": "CONFIRMED"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking status updated to CONFIRMED",
  "data": {
    "id": "BOOK-1706476800000",
    "bookingType": "SHORT_TERM",
    "status": "CONFIRMED",
    "paymentStatus": "PAID",
    "totalAmount": 575,
    "createdAt": "2026-02-05T10:00:00.000Z",
    "updatedAt": "2026-02-05T10:00:00.000Z"
  }
}
```

**Valid Status Values:**
- `PENDING` - Initial booking state
- `CONFIRMED` - Owner accepts booking
- `COMPLETED` - Stay is completed
- `CANCELLED` - Booking cancelled

### 5. Cancel Booking (DELETE)
```bash
# Guest cancels booking
curl -X DELETE http://localhost:3000/api/bookings/BOOK-1706476800000 \
  -H "Authorization: Bearer <guest-token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": null
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Check-out date must be after check-in date",
  "code": "INVALID_INPUT"
}
```

### Query Parameters for GET /api/bookings

| Parameter | Type | Description |
|-----------|------|-------------|
| `propertyId` | string | Filter by property ID |
| `guestId` | string | Filter by guest ID |
| `ownerId` | string | Filter by owner ID |
| `status` | string | Filter by booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED) |
| `paymentStatus` | string | Filter by payment status (PENDING, PARTIAL, PAID, REFUNDED) |
| `from` | date | Filter bookings from this date |
| `to` | date | Filter bookings to this date |
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 10) |

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error |

---

## Required Headers

### For Protected Endpoints (Owner/Admin only)
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### For Public Endpoints (GET)
```
Content-Type: application/json
```
