# Property & Amenities CRUD API Documentation

## Schema Updates

### New Enums Added
- **PriceType**: NIGHTLY, MONTHLY, TOTAL

### Property Model Updates
- `priceType`: Changed from String to PriceType enum
- `originalPrice`: Float (optional) - for showing discount prices
- `occupancy`: Int (default: 0) - percentage 0-100, for owner dashboard
- `revenue`: Float (default: 0) - monthly revenue tracking for owner dashboard
- `sqft`: Int (optional) - square footage
- `guests`: Int (default: 2) - capacity

## Amenities CRUD API

### Endpoints

#### 1. GET /api/amenities
Get all amenities with filters and pagination
- **Query Parameters:**
  - `page`: number (default: 1)
  - `pageSize`: number (default: 50)
  - `search`: string (searches name and category)
  - `category`: string (filter by category)
- **Response:** Paginated list of amenities with property count
- **Auth:** None required

#### 2. POST /api/amenities
Create a new amenity (Admin only)
- **Body:**
  ```json
  {
    "name": "string (required, unique)",
    "category": "string (required)",
    "icon": "string (optional)"
  }
  ```
- **Response:** Created amenity object
- **Auth:** Admin only

#### 3. GET /api/amenities/:id
Get single amenity by ID
- **Response:** Amenity with property count
- **Auth:** None required

#### 4. PUT /api/amenities/:id
Update an amenity (Admin only)
- **Body:**
  ```json
  {
    "name": "string (optional)",
    "category": "string (optional)",
    "icon": "string (optional)"
  }
  ```
- **Response:** Updated amenity object
- **Auth:** Admin only

#### 5. DELETE /api/amenities/:id
Delete an amenity (Admin only)
- **Response:** Success message
- **Auth:** Admin only
- **Note:** Cascade deletes PropertyAmenity relations

## Properties CRUD API Updates

### Updated Property Creation
Now supports all fields from page.tsx schema:
- Pricing fields: price, priceType, originalPrice, cleaningFee, serviceFee, securityDeposit
- Specifications: bedrooms, bathrooms, sqft, guests, minStay, maxStay, parking
- Analytics: occupancy, revenue, views, saves
- Amenities: connected via PropertyAmenity junction table

### Example Property Creation
```json
{
  "title": "Modern Luxury Apartment",
  "description": "...",
  "address": "...",
  "city": "London",
  "state": "England",
  "country": "UK",
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
  "amenities": ["amenity-id-1", "amenity-id-2"],
  "images": [
    {
      "url": "https://...",
      "caption": "Main view",
      "isPrimary": true
    }
  ]
}
```

### Property Update Fields
Updated PATCH endpoint now supports all fields:
- `title`, `description`, `address`, `city`, `state`, `country`, `zipCode`
- `latitude`, `longitude`
- `price`, `originalPrice`, `priceType`
- `propertyType`, `listingType`, `rentalType`
- `bedrooms`, `bathrooms`, `sqft`, `guests`, `minStay`, `maxStay`, `parking`
- `occupancy`, `revenue`, `status`

## Key Relations

### Property → Amenities
- One-to-Many through PropertyAmenity junction table
- When property is deleted, PropertyAmenity records are cascade deleted
- When amenity is deleted, PropertyAmenity records are cascade deleted

### Property → Owner (User)
- Many-to-One relationship
- Owner can view, update, delete their own properties
- Admin can manage all properties

## Response Format

All endpoints follow consistent response format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "statusCode": 200
}
```

## Error Codes
- `400`: Validation error
- `403`: Forbidden (no permission)
- `404`: Not found
- `500`: Internal server error
