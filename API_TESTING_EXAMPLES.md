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
