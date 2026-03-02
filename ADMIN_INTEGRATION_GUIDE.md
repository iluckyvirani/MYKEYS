# Admin Dashboard Integration Guide

This guide demonstrates how to integrate the admin dashboard UI pages with the new API endpoints.

## Project Structure Overview

```
📦 MYKEYS Rental SaaS
├── src/
│   ├── app/
│   │   ├── api/admin/          ← NEW: Admin API endpoints
│   │   │   ├── users/
│   │   │   ├── bookings/
│   │   │   ├── properties/
│   │   │   ├── payments/
│   │   │   ├── owners/
│   │   │   ├── service-providers/
│   │   │   ├── inquiries/
│   │   │   └── stats/
│   │   └── admin/
│   │       └── dashboard/       ← Existing UI pages
│   │           ├── users/
│   │           ├── bookings/
│   │           ├── properties/
│   │           ├── payments/
│   │           └── ...more
│   └── lib/
│       └── auth/                ← Authentication utilities
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Components**: Radix UI + Tailwind CSS
- **Data Fetching**: Axios + React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **State Management**: React Hooks + Context

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT (Jose)
- **Authorization**: Role-Based Access Control (RBAC)

## Authentication & Authorization Pattern

### 1. Middleware Pattern
All admin APIs use the `withAuth` middleware:

```typescript
// /lib/auth/middleware.ts
export function withAuth<T>(
  handler: (request, user, context?) => Promise<NextResponse>,
  options?: { roles?: UserRole[] }
) {
  // Verifies JWT token
  // Checks user role
  // Returns error if unauthorized
}
```

### 2. Role-Based Access Control
```typescript
// ADMIN role ensures only administrators can access
export const GET = withAuth(
  async (request, user) => {
    // Handle request
  },
  { roles: ["ADMIN" as any] }
);
```

## API Response Pattern

All endpoints return standardized JSON responses:

```javascript
// Success Response
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...]
}

// Error Response
{
  "success": false,
  "message": "Failed to retrieve users",
  "code": "INTERNAL_SERVER_ERROR"
}

// Paginated Response
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "pages": 15
  }
}
```

## Integration Examples

### Example 1: Update Admin Users Page

**Current State** (Mock Data):
```tsx
// /src/app/admin/dashboard/users/page.tsx
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using mock data
    const mockUsers: User[] = [{ ... }, { ... }];
    setUsers(mockUsers);
    setLoading(false);
  }, []);
  // ...
}
```

**Integrated State** (Using API):
```tsx
// /src/app/admin/dashboard/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminUserList } from "@/components/dashboard/admin/users/AdminUserList";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "USER" | "OWNER" | "SERVICE";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  propertiesCount: number;
  bookingsAsGuestCount: number;
  bookingsAsOwnerCount: number;
  totalBookings: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [totalUsers, setTotalUsers] = useState(0);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          search: searchTerm,
        });

        if (appliedFilters.role) params.append("role", appliedFilters.role);
        if (appliedFilters.status) params.append("status", appliedFilters.status);

        const response = await axios.get(
          `/api/admin/users?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.data.success) {
          setUsers(response.data.data);
          setTotalUsers(response.data.pagination.total);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, pageSize, searchTerm, appliedFilters]);

  // Handle status update
  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await axios.patch(
        `/api/admin/users`,
        { userId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
      }
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Users Management</h1>
        
        {error && <div className="alert alert-error">{error}</div>}

        <AdminUserList
          users={users}
          loading={loading}
          total={totalUsers}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onStatusChange={handleStatusChange}
          onSearch={setSearchTerm}
          onFilter={setAppliedFilters}
        />
      </div>
    </AdminDashboardLayout>
  );
}
```

### Example 2: Using React Query (TanStack Query)

For better state management, use React Query:

```tsx
// /src/app/admin/dashboard/users/page.tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const USER_QUERY_KEY = ["admin", "users"];

// Custom hook for fetching users
function useAdminUsers(page: number, filters: any) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
        ...filters,
      });

      const { data } = await axios.get(
        `/api/admin/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Custom hook for updating user status
function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: any) => {
      const { data } = await axios.patch(
        `/api/admin/users`,
        { userId, status },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY,
      });
    },
  });
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data: users, isLoading, error } = useAdminUsers(page, filters);
  const updateUserStatus = useUpdateUserStatus();

  return (
    <AdminDashboardLayout>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {users && <AdminUserList users={users} ... />}
    </AdminDashboardLayout>
  );
}
```

### Example 3: Fetching Dashboard Stats

```tsx
// /src/app/admin/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface DashboardStats {
  summary: {
    totalUsers: number;
    totalOwners: number;
    totalServiceProviders: number;
    totalProperties: number;
    conversionRate: string;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
  };
  payments: {
    totalRevenue: number;
    successRate: string;
  };
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return data.data as DashboardStats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) return <div>Loading stats...</div>;

  return (
    <AdminDashboardLayout>
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.summary.totalUsers}
          icon="👥"
        />
        <StatsCard
          title="Total Properties"
          value={stats?.summary.totalProperties}
          icon="🏠"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats?.payments.totalRevenue}`}
          icon="💰"
        />
        <StatsCard
          title="Conversion Rate"
          value={stats?.summary.conversionRate}
          icon="📈"
        />
      </div>
    </AdminDashboardLayout>
  );
}
```

## Common Patterns

### 1. Pagination
```javascript
// Fetch page 2 with 20 items per page
/api/admin/users?page=2&pageSize=20

// Response includes pagination info
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 2,
    "pageSize": 20,
    "pages": 8
  }
}
```

### 2. Filtering
```javascript
// Fetch only OWNER users with ACTIVE status
/api/admin/users?role=OWNER&status=ACTIVE

// Fetch properties in a specific price range
/api/admin/properties?minPrice=50000&maxPrice=500000
```

### 3. Searching
```javascript
// Search users by name/email
/api/admin/users?search=rajesh

// Search properties by location
/api/admin/properties?search=bangalore
```

### 4. Sorting
```javascript
// Sort by name in ascending order
/api/admin/users?sortBy=name&sortOrder=asc

// Sort by price in descending order
/api/admin/properties?sortBy=price&sortOrder=desc
```

## Error Handling

Implement proper error handling in your components:

```tsx
import { useState } from "react";
import { toast } from "sonner"; // Your toast library

async function fetchData() {
  try {
    const response = await axios.get("/api/admin/users");

    if (!response.data.success) {
      toast.error(response.data.message);
      return;
    }

    // Handle success
    setUsers(response.data.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      toast.error("Unauthorized. Please login again.");
      // Redirect to login
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to access this.");
    } else {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }
}
```

## Performance Optimization

### 1. Debounce Search
```javascript
import { useDebouncedValue } from "@/hooks/use-debounce";

const debouncedSearch = useDebouncedValue(searchTerm, 500);

useEffect(() => {
  // Only fetch when debounced value changes
  if (debouncedSearch) {
    fetchUsers({ search: debouncedSearch });
  }
}, [debouncedSearch]);
```

### 2. Caching
```javascript
// React Query automatically caches responses
const { data } = useQuery({
  queryKey: ["admin", "users", page],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

### 3. Lazy Loading
```javascript
// Only fetch properties when admin visits the page
const { data: properties } = useQuery({
  queryKey: ["admin", "properties"],
  queryFn: fetchProperties,
  enabled: shouldFetch, // Don't fetch if disabled
});
```

## Testing API Endpoints

### Using cURL
```bash
# Get users
curl -X GET "http://localhost:3000/api/admin/users?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update user status
curl -X PATCH "http://localhost:3000/api/admin/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","status":"SUSPENDED"}'
```

### Using Postman
1. Import [MYKEYS-API-Collection.postman_collection.json](postman/MYKEYS-API-Collection.postman_collection.json)
2. Set `Authorization` header with JWT token
3. Test each endpoint

### Using Browser Developer Tools
```javascript
// In browser console
fetch('/api/admin/users?page=1', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
}).then(r => r.json()).then(d => console.log(d))
```

## Database Considerations

The APIs interact with the following Prisma models:

- **User** - RBAC with role: ADMIN, OWNER, SERVICE, USER
- **Property** - Property listings with ownership
- **Booking** - Guest property bookings
- **Payment** - Payment records
- **Inquiry** - Property inquiries
- **ServiceRequest** - Service requests
- **ServiceBooking** - Service bookings

### Key Relationships
```
User (Admin) ─→ can manage ─→ [Users, Properties, Bookings, Payments, etc.]
Property ─→ belongs to ─→ User (Owner)
Booking ─→ links ─→ Guest (User) & Property
Payment ─→ related to ─→ Booking or ServiceBooking
```

## Security Best Practices

1. **Always validate JWT tokens** - Done via `withAuth` middleware
2. **Check user roles** - Only ADMIN role can access admin APIs
3. **Validate input data** - Check required fields and formats
4. **Sanitize search inputs** - Prevent SQL injection
5. **Rate limit sensitive operations** - Implement for production
6. **Log admin actions** - Track who made what changes
7. **Use HTTPS only** - Ensure secure token transmission
8. **Refresh tokens regularly** - Implement token rotation

## Summary Table

| Component | Location | Purpose |
|-----------|----------|---------|
| API Routes | `/src/app/api/admin/` | Backend endpoints |
| UI Pages | `/src/app/admin/dashboard/` | Frontend pages |
| Middleware | `/src/lib/auth/middleware.ts` | Auth/Auth checking |
| Types | `/src/types/` | TypeScript interfaces |
| Hooks | `/src/lib/hooks/` | Custom React hooks |

## Next Steps

1. **Update all admin dashboard pages** to use the new APIs
2. **Implement error boundaries** for better error handling
3. **Add loading states** in UI components
4. **Set up React Query** for optimal data fetching
5. **Add audit logging** for all admin actions
6. **Implement rate limiting** on sensitive operations
7. **Test thoroughly** with various user scenarios
8. **Monitor performance** in production
