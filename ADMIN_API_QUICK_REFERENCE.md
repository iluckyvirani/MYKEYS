# Admin API Quick Reference

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
All requests require `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Users Management

### List Users
```
GET /api/admin/users
  ?page=1
  &pageSize=10
  &role=OWNER|USER|SERVICE|ALL
  &status=ACTIVE|INACTIVE|SUSPENDED|PENDING
  &search=keyword
  &sortBy=createdAt|name|email|status
  &sortOrder=asc|desc
```

### Update User Status
```
PATCH /api/admin/users
Body:
{
  "userId": "user-123",
  "status": "SUSPENDED|ACTIVE|INACTIVE|PENDING"
}
```

---

## Bookings Management

### List Bookings
```
GET /api/admin/bookings
  ?page=1
  &pageSize=10
  &status=PENDING|CONFIRMED|CANCELLED|COMPLETED|CHECKED_IN|CHECKED_OUT
  &paymentStatus=PENDING|PAID|FAILED|REFUNDED|PARTIAL
  &propertyId=prop-123
  &guestId=guest-123
  &ownerId=owner-123
  &from=2025-01-01
  &to=2025-01-31
  &searchTerm=keyword
  &sortBy=createdAt|checkIn|amount|status
  &sortOrder=asc|desc
```

### Update Booking
```
PATCH /api/admin/bookings
Body:
{
  "bookingId": "booking-123",
  "status": "CONFIRMED|PENDING|CANCELLED|COMPLETED",
  "paymentStatus": "PAID|PENDING|FAILED|REFUNDED",
  "notes": "admin notes"
}
```

---

## Properties Management

### List Properties
```
GET /api/admin/properties
  ?page=1
  &pageSize=10
  &status=ACTIVE|DRAFT|PENDING_REVIEW|INACTIVE|SOLD|RENTED|MAINTENANCE
  &propertyType=APARTMENT|VILLA|HOUSE|COTTAGE|PENTHOUSE|BUNGALOW|CONDOMINIUM|TOWNHOUSE|STUDIO
  &city=Bangalore
  &ownerId=owner-123
  &minPrice=50000
  &maxPrice=500000
  &search=keyword
  &sortBy=createdAt|price|title|city|rating
  &sortOrder=asc|desc
```

### Update Property
```
PATCH /api/admin/properties
Body:
{
  "propertyId": "prop-123",
  "status": "ACTIVE|DRAFT|PENDING_REVIEW|INACTIVE|SOLD|RENTED|MAINTENANCE",
  "notes": "admin notes"
}
```

---

## Payments Management

### List Payments
```
GET /api/admin/payments
  ?page=1
  &pageSize=10
  &status=PENDING|PAID|FAILED|REFUNDED|PARTIAL
  &paymentMethod=UPI|CREDIT_CARD|DEBIT_CARD|NET_BANKING|CASH|WALLET|BANK_TRANSFER
  &from=2025-01-01
  &to=2025-01-31
  &userId=user-123
  &bookingId=booking-123
  &search=keyword
  &sortBy=createdAt|amount|status|method
  &sortOrder=asc|desc
```

### Update Payment
```
PATCH /api/admin/payments
Body:
{
  "paymentId": "payment-123",
  "status": "PAID|PENDING|FAILED|REFUNDED|PARTIAL",
  "notes": "admin notes"
}
```

---

## Owners Management

### List Owners
```
GET /api/admin/owners
  ?page=1
  &pageSize=10
  &status=ACTIVE|INACTIVE|SUSPENDED|PENDING
  &search=keyword
  &sortBy=createdAt|name|email|properties
  &sortOrder=asc|desc
```

### Update Owner
```
PATCH /api/admin/owners
Body:
{
  "userId": "owner-123",
  "status": "SUSPENDED|ACTIVE|INACTIVE|PENDING",
  "notes": "admin notes"
}
```

---

## Service Providers Management

### List Service Providers
```
GET /api/admin/service-providers
  ?page=1
  &pageSize=10
  &status=ACTIVE|INACTIVE|SUSPENDED|PENDING
  &verified=true|false
  &search=keyword
  &sortBy=createdAt|name|email|rating
  &sortOrder=asc|desc
```

### Update Service Provider
```
PATCH /api/admin/service-providers
Body:
{
  "userId": "provider-123",
  "status": "SUSPENDED|ACTIVE|INACTIVE|PENDING",
  "verified": true|false,
  "notes": "admin notes"
}
```

---

## Inquiries Management

### List Inquiries
```
GET /api/admin/inquiries
  ?page=1
  &pageSize=10
  &status=NEW|READ|REPLIED|CLOSED|CONVERTED
  &propertyId=prop-123
  &from=2025-01-01
  &to=2025-01-31
  &searchTerm=keyword
  &sortBy=createdAt|status|email
  &sortOrder=asc|desc
```

### Update Inquiry
```
PATCH /api/admin/inquiries
Body:
{
  "inquiryId": "inquiry-123",
  "status": "REPLIED|READ|CLOSED|CONVERTED",
  "reply": "customer reply message",
  "notes": "admin notes"
}
```

---

## Dashboard Stats & Reports

### Get Dashboard Stats
```
GET /api/admin/stats
  ?from=2025-01-01
  &to=2025-01-31

Response includes:
- Summary (total users, properties, conversion rate)
- Bookings metrics
- Payments metrics
- Inquiries count
- Distribution by role/method
```

### Generate Reports
```
PATCH /api/admin/stats
  ?type=users|properties|bookings|revenue
  &period=day|week|month|year

Types:
- users: Distribution by role and status
- properties: Top properties, status distribution
- bookings: Bookings by status, by owner
- revenue: Revenue by payment method, daily trend
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "pages": 15
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Common Query Combinations

### Active Users
```
GET /api/admin/users?status=ACTIVE
```

### Owner Properties in Bangalore
```
GET /api/admin/properties?ownerId=owner-123&city=Bangalore
```

### Completed Bookings
```
GET /api/admin/bookings?status=COMPLETED&sortBy=createdAt&sortOrder=desc
```

### Recent Payments
```
GET /api/admin/payments?sortBy=createdAt&sortOrder=desc&pageSize=20
```

### New Inquiries
```
GET /api/admin/inquiries?status=NEW
```

### Unverified Service Providers
```
GET /api/admin/service-providers?verified=false
```

---

## JavaScript Examples

### Fetch Users
```javascript
const response = await fetch('/api/admin/users?page=1&pageSize=20', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
});
const data = await response.json();
console.log(data.data); // Array of users
```

### Update User Status
```javascript
const response = await fetch('/api/admin/users', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user-123',
    status: 'SUSPENDED'
  })
});
const data = await response.json();
```

### Get Dashboard Stats
```javascript
const response = await fetch('/api/admin/stats', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
});
const { data: stats } = await response.json();
console.log(stats.summary.totalUsers);
console.log(stats.payments.totalRevenue);
```

### Search Properties
```javascript
const query = new URLSearchParams({
  search: 'bangalore',
  status: 'ACTIVE',
  minPrice: '50000',
  maxPrice: '500000'
});
const response = await fetch(`/api/admin/properties?${query}`, {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
});
```

---

## Axios Examples

### Setup
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
});
```

### Fetch with Filters
```typescript
const { data } = await apiClient.get('/users', {
  params: {
    page: 1,
    pageSize: 20,
    role: 'OWNER',
    status: 'ACTIVE'
  }
});
```

### Update Record
```typescript
const { data } = await apiClient.patch('/users', {
  userId: 'user-123',
  status: 'SUSPENDED'
});
```

---

## React Hook Examples

### Custom Hook for Fetching
```typescript
function useAdminUsers(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/users', { params: filters })
      .then(res => setData(res.data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  return { data, loading, error };
}
```

### Using in Component
```tsx
function AdminUsersPage() {
  const [filters, setFilters] = useState({ page: 1 });
  const { data: users, loading } = useAdminUsers(filters);

  return (
    <div>
      {loading ? <Spinner /> : <UsersList users={users} />}
    </div>
  );
}
```

---

## Performance Tips

1. **Use pagination** - Always specify `page` and `pageSize`
2. **Filter on backend** - Use API filters instead of filtering client-side
3. **Debounce search** - Wait 300-500ms before making search requests
4. **Cache responses** - Use React Query or SWR for caching
5. **Lazy load** - Only fetch data when needed
6. **Limit fields** - Only request needed fields (backend optimization)

---

## Troubleshooting

### 401 Unauthorized
- Check JWT token in localStorage
- Verify token is not expired
- Check `Authorization` header format

### 403 Forbidden
- Verify user has ADMIN role
- Check JWT payload: `role: "ADMIN"`

### 404 Not Found
- Verify API endpoint path is correct
- Check ID parameters are valid

### 500 Server Error
- Check server logs
- Verify request body format
- Ensure required fields are provided

---

## Rate Limits
Currently **no rate limits** implemented. Add in production:
- Per-IP limits
- Per-user limits
- Per-endpoint limits

---

## Security Headers
All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## File Locations
- API Routes: `/src/app/api/admin/*/route.ts`
- Documentation: `ADMIN_API_DOCUMENTATION.md`
- Integration Guide: `ADMIN_INTEGRATION_GUIDE.md`
- Postman Collection: `/postman/MYKEYS-API-Collection.postman_collection.json`

---

## Support
For issues or questions, check:
1. [ADMIN_API_DOCUMENTATION.md](ADMIN_API_DOCUMENTATION.md)
2. [ADMIN_INTEGRATION_GUIDE.md](ADMIN_INTEGRATION_GUIDE.md)
3. Server logs for detailed errors
4. Database schema in `/prisma/schema.prisma`
