# Admin Authentication & Route Protection

## Overview
This document explains the admin authentication system and how admin routes are protected in the MYKEYS application.

## Architecture

### Three Layers of Protection

#### 1. **Admin Login Page** (`/admin/login`)
- Separate login page for admin users
- Validates that user has `ADMIN` role
- Redirects to `/admin/dashboard` on successful login
- Stores authentication tokens in localStorage

#### 2. **Admin Layout Protection** (`/admin/layout.tsx`)
- Wraps all admin routes
- Checks for valid token and ADMIN role
- Provides loading state during verification
- Redirects unauthorized users to `/admin/login`

#### 3. **Component-Level Protection** (`ProtectAdminRoute.tsx`)
- Wraps dashboard layout
- Double-checks admin authorization
- Handles token expiration
- Prevents unauthorized access

## Files & Components

### Login Page
**Location:** `src/app/admin/login/page.tsx`

```typescript
// Key features:
- Email & password input fields
- Admin-specific styling and messaging
- Role validation after login
- Redirects to /admin/dashboard on success
- Links back to regular /login
```

**Flow:**
1. User enters email and password
2. API calls `/auth/login`
3. Checks if user has ADMIN role
4. If not admin → shows error "Unauthorized: Admin access only"
5. If admin → stores tokens and redirects to `/admin/dashboard`

### Admin Layout
**Location:** `src/app/admin/layout.tsx`

```typescript
// Main entry point for all admin routes
// Protects:
// - /admin/dashboard
// - /admin/dashboard/users
// - /admin/dashboard/properties
// - All other admin pages
```

**Verification Process:**
1. Checks for valid access token in localStorage
2. Retrieves stored user data
3. Validates ADMIN role in localStorage
4. Makes API call to `/auth/me` to verify with backend
5. If unauthorized → redirects to `/admin/login`
6. If expired token → clears storage and redirects to `/admin/login`

**Loading State:**
Shows animated spinner during verification

### Protection Component
**Location:** `src/components/dashboard/ProtectAdminRoute.tsx`

```typescript
// Used by AdminDashboardLayout
// Additional client-side protection layer
```

**Features:**
- Verifies admin status
- Handles token expiration
- Shows loading state
- Prevents unauthorized render

### Admin Hooks
**Location:** `src/lib/hooks/useAdmin.ts`

#### `useAdminAccess()`
```typescript
const { isAdmin, isLoading, user } = useAdminAccess();

// Returns:
// - isAdmin: boolean (true if user has ADMIN role)
// - isLoading: boolean (true while checking)
// - user: UserDTO | null (current user object)
```

**Usage:**
```typescript
export default function MyAdminComponent() {
  const { isAdmin, isLoading } = useAdminAccess();

  if (isLoading) return <div>Loading...</div>;
  if (!isAdmin) return null; // Will redirect automatically

  return <YourComponent />;
}
```

#### `useAdminLogout()`
```typescript
const { logout } = useAdminLogout();

// Usage:
const handleLogout = async () => {
  await logout(); // Clears storage and redirects to /admin/login
};
```

## Authentication Flow

### Login Flow
```
User visits /admin/login
         ↓
Enters credentials
         ↓
POST /auth/login
         ↓
Check if roles contains "ADMIN"
    ├─ Yes → Store tokens → Redirect to /admin/dashboard
    └─ No → Show error "Unauthorized"
```

### Route Access Flow
```
User requests /admin/dashboard
         ↓
Admin Layout checks authorization
    ├─ No token → Redirect to /admin/login
    ├─ No ADMIN role → Redirect to /
    ├─ Token valid → Allow access
    └─ Token expired → Clear storage → Redirect to /admin/login
```

## Key Features

### 1. **Role-Based Access Control**
```typescript
if (!user.roles.includes("ADMIN")) {
  redirect("/");
}
```

### 2. **Dual Verification**
- Client-side: localStorage check
- Server-side: `/auth/me` API verification

### 3. **Automatic Cleanup**
- Expired tokens are cleared
- Invalid sessions are reset
- User redirected to login

### 4. **Loading States**
- Shows spinner during verification
- Prevents flash of unauthorized content
- Better UX for slower connections

### 5. **Graceful Fallback**
- If API call fails, falls back to localStorage check
- Still ensures user has ADMIN role
- Redirects accordingly

## Security Considerations

### Token Management
- Tokens stored in localStorage
- Users should logout to clear tokens
- Expired tokens are automatically cleared

### Role Validation
- Always check for ADMIN role
- Don't trust client-side checks alone
- Verify with backend when possible

### Redirect Strategy
- Unauthorized users → `/` (home page)
- Unauthenticated users → `/admin/login`
- Expired sessions → `/admin/login` with cleared storage

### CORS & API Security
- Admin API endpoints should validate ADMIN role on backend
- Rate limiting should be implemented
- Admin actions should be logged

## Admin User Setup

### Creating Admin Users

**Backend Requirement:**
Users with ADMIN role must be created through:
1. Database migration
2. Admin creation endpoint
3. Backend user management

**User Object Structure:**
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: ["ADMIN"];  // Must contain "ADMIN"
  status: "ACTIVE";
  // ... other fields
}
```

### Testing Admin Access

**Test Login:**
```
Email: admin@example.com
Password: (admin password)
```

**Verify:**
1. Should redirect to `/admin/dashboard`
2. Sidebar and header should appear
3. All admin pages should be accessible

**Non-Admin User Test:**
```
Email: user@example.com
Password: (user password)
```

**Verify:**
1. Login to `/login` (regular login)
2. Should NOT be able to access `/admin/dashboard`
3. Attempting to access → redirects to `/`

## Protected Routes

All routes under `/admin/*` are protected:

```
/admin/login                    📍 Public (login page)
/admin/dashboard                🔒 ADMIN only
/admin/dashboard/users          🔒 ADMIN only
/admin/dashboard/owners         🔒 ADMIN only
/admin/dashboard/service-providers 🔒 ADMIN only
/admin/dashboard/properties     🔒 ADMIN only
/admin/dashboard/bookings       🔒 ADMIN only
/admin/dashboard/categories     🔒 ADMIN only
/admin/dashboard/amenities      🔒 ADMIN only
/admin/dashboard/documents      🔒 ADMIN only
/admin/dashboard/inquiries      🔒 ADMIN only
/admin/dashboard/payments       🔒 ADMIN only
/admin/dashboard/profile        🔒 ADMIN only
```

## Implementation Checklist

### Backend Setup
- [ ] Admin user created in database
- [ ] ADMIN role added to user
- [ ] Login API working
- [ ] `/auth/me` endpoint validates ADMIN role
- [ ] Token generation/validation working

### Frontend Setup
- [ ] Admin login page created ✅
- [ ] Admin layout with protection ✅
- [ ] Route protection component ✅
- [ ] Admin hooks created ✅
- [ ] Sidebar logout updated ✅

### Testing
- [ ] Admin can login at `/admin/login`
- [ ] Admin redirected to `/admin/dashboard`
- [ ] Non-admin redirected to `/`
- [ ] Token expiration handled
- [ ] Logout clears tokens
- [ ] All admin pages accessible to admin
- [ ] All admin pages blocked for non-admin

## Troubleshooting

### Issue: Can't access `/admin/dashboard` even with token
**Solution:**
1. Check if user has ADMIN role in database
2. Verify loan token is valid
3. Check if `/auth/me` returns ADMIN role
4. Clear browser storage and try again

### Issue: Stuck on loading spinner
**Solution:**
1. Check network tab for API errors
2. Verify `/auth/me` endpoint is working
3. Check if token is expired
4. Check browser console for errors

### Issue: Can't login to `/admin/login`
**Solution:**
1. Verify user exists and has ADMIN role
2. Check email/password credentials
3. Verify `/auth/login` API works
4. Check if user.roles contains "ADMIN"

### Issue: Unauthorized redirects to home
**Solution:**
1. Ensure user has ADMIN role (not just OWNER)
2. Check user.roles array in localStorage
3. Verify backend user has correct role
4. Try logging in again

## Best Practices

### 1. Always Use Hooks
```typescript
// ✅ Good
const { isAdmin } = useAdminAccess();

// ❌ Avoid
const user = JSON.parse(localStorage.getItem("user"));
if (user.roles.includes("ADMIN")) { ... }
```

### 2. Handle Loading States
```typescript
// ✅ Good
const { isLoading } = useAdminAccess();
if (isLoading) return <LoadingSpinner />;

// ❌ Avoid
// Rendering before verification complete
```

### 3. Use Logout Hook
```typescript
// ✅ Good
const { logout } = useAdminLogout();
await logout();

// ❌ Avoid
// Manually clearing storage
```

### 4. Verify Backend
```typescript
// ✅ Good
// Check role at backend before returning sensitive data

// ❌ Avoid
// Trusting client-side role checks alone
```

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Admin activity logging
- [ ] Session management dashboard
- [ ] IP whitelisting
- [ ] Admin permissions system
- [ ] Role-based admin access (e.g., super-admin, moderator)
- [ ] Audit trail for admin actions
- [ ] Admin password policy enforcement
- [ ] Rate limiting on login attempts
- [ ] Email verification for admin accounts

## Quick Reference

### Access Admin Dashboard
```
1. Go to /admin/login
2. Enter admin credentials
3. Should redirect to /admin/dashboard
```

### Logout
```
1. Click "Logout" in sidebar
2. Tokens cleared
3. Redirected to /admin/login
```

### Check Admin Status
```typescript
import { useAdminAccess } from "@/lib/hooks/useAdmin";

const { isAdmin, user } = useAdminAccess();
```

### Protect a Component
```typescript
import ProtectAdminRoute from "@/components/dashboard/ProtectAdminRoute";

export default function Protected() {
  return (
    <ProtectAdminRoute>
      <YourComponent />
    </ProtectAdminRoute>
  );
}
```
