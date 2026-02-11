# Payment APIs - Design Pattern Comparison

This document shows how the payment APIs follow the same design patterns as other APIs in the system.

---

## 1. Service Layer Pattern

### Reviews API (Reference Implementation)
```typescript
// src/lib/reviews/reviewService.ts
export const reviewService = {
  async create(data: ReviewInput) { ... },
  async getAll(filters: ReviewFilter = {}) { ... },
  async getById(id: string) { ... },
}
```

### Payment API (Following Same Pattern)
```typescript
// src/lib/payments/paymentService.ts
export const paymentService = {
  async initiatePayment(data: InitiatePaymentRequest, userId: string) { ... },
  async verifyPayment(paymentId: string, data: VerifyPaymentRequest, userId: string) { ... },
  async processRefund(paymentId: string, refundData: ProcessRefundRequest, userId: string) { ... },
  async getPayments(filters: PaymentFilter = {}) { ... },
  async getPaymentById(paymentId: string, userId: string) { ... },
}
```

**Pattern:**
✅ Export service object with async methods  
✅ Separation of business logic from API routes  
✅ Reusable across multiple route handlers  
✅ Easy to test and maintain

---

## 2. Authentication & Authorization

### Bookings API (Reference)
```typescript
// src/app/api/bookings/route.ts
export const GET = withAuth(async (request, user: JWTPayload) => {
  // User context automatically provided
  where.guestId = user.userId;
  // ...
});
```

### Payment API (Following Same Pattern)
```typescript
// src/app/api/payments/route.ts
export const GET = withAuth(async (request, user: JWTPayload) => {
  filters.userId = user.userId;
  // ...
});
```

**Pattern:**
✅ Use `withAuth` middleware for all protected routes  
✅ Extract user from JWT token automatically  
✅ Pass user context to service methods  
✅ Implicit user isolation (no manual ID checks needed)

---

## 3. Response Format

### Reviews API (Reference)
```typescript
// src/app/api/reviews/route.ts
return NextResponse.json(result); // Direct response

// Result structure from service:
{
  id: "review_789",
  rating: 5,
  comment: "...",
  // ...
}
```

### Payment API (Enhanced with Response Helpers)
```typescript
// src/app/api/payments/route.ts
return successResponse(result, 'Payment initiated successfully', 201);
return errorResponse(error.message || 'Failed to fetch payments', 500);
return paginatedResponse(items, total, page, limit, 'Success message');

// Standardized response format:
{
  success: true,
  message: "Payment initiated successfully",
  data: { ... },
  code?: "ERROR_CODE"
}
```

**Pattern:**
✅ Use response helpers for consistency  
✅ Include message with every response  
✅ Use proper HTTP status codes  
✅ Include error codes for programmatic handling

---

## 4. Filtering & Pagination

### Reviews API (Reference)
```typescript
const filters: ReviewFilter = {
  propertyId: searchParams.get('propertyId') || undefined,
  userId: searchParams.get('userId') || undefined,
  page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
  limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
};

const result = await reviewService.getAll(filters);
```

### Payment API (Following Same Pattern)
```typescript
const filters: PaymentFilter = {
  userId: user.userId,
  status: (searchParams.get('status') as any) || undefined,
  bookingId: searchParams.get('bookingId') || undefined,
  page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
  limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
};

const result = await paymentService.getPayments(filters);
```

**Pattern:**
✅ Extract filters from query parameters  
✅ Type-safe filter objects  
✅ Default pagination values (page: 1, limit: 10)  
✅ Service handles database query logic

---

## 5. Dynamic Route Parameters

### Bookings API (Reference)
```typescript
// src/app/api/bookings/[id]/route.ts
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, user, context) => {
    const { id } = await context!.params;
    // ...
  }
);
```

### Payment API (Following Same Pattern)
```typescript
// src/app/api/payments/[id]/route.ts
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, user, context) => {
    const { id } = await context!.params;
    // ...
  }
);
```

**Pattern:**
✅ Use TypeScript generics for params type safety  
✅ Await params for Next.js 15+ compatibility  
✅ Validate ID before using  
✅ Return appropriate HTTP status codes (404 for not found)

---

## 6. Nested Routes for Related Resources

### Bookings API (Reference)
```
/api/bookings/[id]/
  ├── route.ts              (GET, PATCH, DELETE)
  └── payments/
      └── route.ts          (GET, POST for booking payments)
```

### Payment API (Extended Pattern)
```
/api/payments/
  ├── route.ts              (GET all, POST new)
  └── [id]/
      ├── route.ts          (GET specific)
      ├── verify/
      │   └── route.ts      (POST verify)
      └── refund/
          └── route.ts      (POST refund)

/api/bookings/[id]/
  └── payments/
      └── route.ts          (GET, POST for specific booking)

/api/packages/[id]/
  └── payments/
      └── route.ts          (GET, POST for specific package)
```

**Pattern:**
✅ Group related resources using nested routes  
✅ Keep endpoints RESTful and intuitive  
✅ Use HTTP verbs correctly (GET for retrieve, POST for create/action)  
✅ Include filtering/pagination where appropriate

---

## 7. Input Validation

### Reviews API (Reference)
```typescript
if (data.rating < 1 || data.rating > 5) {
  throw new Error('Rating must be between 1 and 5');
}
```

### Payment API (Following Same Pattern)
```typescript
if (!data.amount || data.amount <= 0) {
  throw new Error('Amount must be greater than 0');
}

if (!data.bookingId && !data.packageId) {
  throw new Error('Either bookingId or packageId must be provided');
}
```

**Pattern:**
✅ Validate in service methods  
✅ Throw descriptive errors  
✅ Let API route catch and format errors  
✅ Return appropriate HTTP status codes

---

## 8. Error Handling

### Reviews API (Reference)
```typescript
export async function POST(req: NextRequest) {
  try {
    const review = await reviewService.create(data);
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create review' },
      { status: err.message ? 400 : 500 }
    );
  }
}
```

### Payment API (Enhanced with Error Helpers)
```typescript
export const POST = withAuth(async (request, user) => {
  try {
    const result = await paymentService.initiatePayment(data, user.userId);
    return successResponse(result, 'Payment initiated successfully', 201);
  } catch (error: any) {
    if (error.message === 'Payment not found') {
      return errorResponse('Payment not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }
    return errorResponse(error.message || 'Failed to initiate payment', 400);
  }
});
```

**Pattern:**
✅ Try-catch blocks in all API routes  
✅ Specific error handling for different cases  
✅ Use error codes for client-side handling  
✅ Return appropriate status codes

---

## 9. Type Safety

### Reviews API (Reference)
```typescript
export interface ReviewInput {
  rating: number;
  comment?: string;
  propertyId: string;
  // ...
}

export interface ReviewFilter {
  propertyId?: string;
  page?: number;
  limit?: number;
  // ...
}
```

### Payment API (Following Same Pattern)
```typescript
export interface InitiatePaymentRequest {
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  bookingId?: string;
  packageId?: string;
}

export interface PaymentFilter {
  userId?: string;
  status?: PaymentStatus;
  bookingId?: string;
  page?: number;
  limit?: number;
}
```

**Pattern:**
✅ Define input/output types in types/payment.ts  
✅ Use enums for fixed values  
✅ Optional fields marked with `?`  
✅ Filter types for complex queries

---

## 10. Business Logic Example Comparison

### Reviews API: Ownership & Verification
```typescript
// Only user can review their own booking
if (booking.guestId !== data.userId) {
  throw new Error('You can only review your own bookings');
}

// Auto-verify if booking completed
if (booking.status === 'COMPLETED' || booking.status === 'CHECKED_OUT') {
  isVerified = true;
}
```

### Payment API: Ownership & Balance Validation
```typescript
// Only guest can pay for booking
if (booking.guestId !== user.userId) {
  return errorResponse('Only booking guest can pay', 403);
}

// Can't pay more than balance
const remainingBalance = booking.totalAmount - (booking.paidAmount || 0);
if (data.amount > remainingBalance) {
  throw new Error(`Payment exceeds remaining balance of ${remainingBalance}`);
}

// Package payment: prevent duplicate subscriptions
const existingPayment = await prisma.payment.findFirst({
  where: {
    packageId: id,
    userId: user.userId,
    status: { in: ['PENDING', 'PAID'] }
  }
});
if (existingPayment?.status === 'PAID') {
  throw new Error('Already have active subscription');
}
```

**Pattern:**
✅ Implement business rules in service layer  
✅ Validate user ownership/permissions  
✅ Check related resource constraints  
✅ Prevent invalid state transitions

---

## Summary: Design Consistency

| Aspect | Reviews API | Payments API | Pattern |
|--------|------------|-------------|---------|
| **Service Layer** | `reviewService` | `paymentService` | ✅ Consistent |
| **Routes** | API routes delegate to service | API routes delegate to service | ✅ Consistent |
| **Authentication** | `withAuth` middleware | `withAuth` middleware | ✅ Consistent |
| **Filtering** | Query params → filters object | Query params → filters object | ✅ Consistent |
| **Pagination** | Handled in service | Handled in service | ✅ Consistent |
| **Errors** | Try-catch, custom messages | Try-catch, error codes | ✅ Enhanced |
| **Response Format** | Direct JSON | Standard response helpers | ✅ Improved |
| **Type Safety** | Strong typing | Strong typing | ✅ Consistent |
| **Database Access** | Prisma ORM | Prisma ORM | ✅ Consistent |

---

## Key Takeaways

1. **Scalability**: Service pattern allows easy addition of new endpoints
2. **Maintainability**: Business logic centralized in service layer
3. **Testability**: Services can be tested independently
4. **Security**: Authentication/authorization at middleware level
5. **Consistency**: All APIs follow same patterns for familiarity
6. **Type Safety**: Full TypeScript support prevents runtime errors
7. **Error Handling**: Standardized error responses with codes
8. **DX**: Clear separation of concerns makes code easy to navigate
