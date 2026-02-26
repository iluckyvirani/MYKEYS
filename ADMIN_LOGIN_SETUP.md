# Admin Access Protection - Quick Setup Guide

## What Was Created

### 1. Admin Login Page 🔑
**Path:** `src/app/admin/login/page.tsx`
- Standalone login for admin users only
- Shows admin-specific UI with Shield icon
- Validates ADMIN role after login
- Redirects to `/admin/dashboard` on success
- Has link back to regular `/login`

### 2. Admin Layout (Route Protection) 🛡️
**Path:** `src/app/admin/layout.tsx`
- Wraps ALL admin routes
- Main verification point
- Checks: Token + ADMIN role + Backend verification
- Shows loading spinner during check
- Redirects unauthorized users

### 3. Admin Route Protection Component 🔐
**Path:** `src/components/dashboard/ProtectAdminRoute.tsx`
- Additional client-side protection layer
- Used inside AdminDashboardLayout
- Double-checks authorization
- Handles token expiration gracefully

### 4. Admin Hooks 🪝
**Path:** `src/lib/hooks/useAdmin.ts`

**`useAdminAccess()`** - Check if user is admin
```typescript
const { isAdmin, isLoading, user } = useAdminAccess();
```

**`useAdminLogout()`** - Logout admin user
```typescript
const { logout } = useAdminLogout();
```

## How Protection Works

### Protection Layers (in order)

```
1️⃣ Admin Layout (/admin/layout.tsx)
   ├─ Checks for access token
   ├─ Validates ADMIN role in localStorage
   └─ Verifies with backend via /auth/me

2️⃣ AdminDashboardLayout with ProtectAdminRoute
   ├─ Re-validates localStorage
   ├─ Checks ADMIN role again
   └─ Shows loading during check

3️⃣ Individual Page Components
   ├─ Uses AdminDashboardLayout
   └─ Protected by above layers
```

### Authorization Check Logic

```typescript
// This is what gets checked at each level:

if (!accessToken) {
  redirect("/admin/login");
}

const user = localStorage.getItem("user");
if (!user || !user.roles.includes("ADMIN")) {
  redirect("/");  // Non-admin redirects to home
}

// Backend verification
const meResponse = await api.get("/auth/me");
if (!meResponse.data.roles.includes("ADMIN")) {
  redirect("/");
}
```

## Routes Protection Flow

### ✅ Admin User Access Example

```
1. User visits /admin/dashboard
   ↓
2. Admin Layout middleware checks
   - accessToken ✓ (exists)
   - ADMIN role ✓ (in localStorage)
   ↓
3. Backend verification
   - /auth/me call succeeds ✓
   - User has ADMIN role ✓
   ↓
4. ProtectAdminRoute approves
   ✓ Access granted
   ↓
5. Dashboard renders
```

### ❌ Non-Admin User Attempt

```
1. User visits /admin/dashboard
   ↓
2. Admin Layout middleware checks
   - ADMIN role ✗ (not in roles array)
   ↓
3. Immediately redirects to /
   (Home page)
```

### ⏰ Expired Token Example

```
1. User visits /admin/dashboard
   ↓
2. Admin Layout finds token
   ↓
3. Backend verification fails
   - /auth/me returns 401
   ↓
4. Clears localStorage
   - accessToken cleared ❌
   - refreshToken cleared ❌
   - user cleared ❌
   ↓
5. Redirects to /admin/login
```

## File Structure Created

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx                    ← Main route protection
│       ├── login/
│       │   └── page.tsx                  ← Admin login page
│       └── dashboard/
│           └── ... (all protected)
│
├── components/
│   └── dashboard/
│       ├── ProtectAdminRoute.tsx         ← Component protection
│       ├── AdminSidebar.tsx              ← Updated with logout hook
│       └── AdminDashboardLayout.tsx      ← Uses ProtectAdminRoute
│
└── lib/
    └── hooks/
        └── useAdmin.ts                   ← Admin access hooks
```

## Testing Access Control

### ✅ Test Admin Access
```
1. Go to /admin/login
2. Login as admin user
3. Should see /admin/dashboard
4. Sidebar and all features work
5. Can navigate to all admin pages
```

### ❌ Test Non-Admin Block
```
1. Go to /admin/login
2. Login as regular user
3. See error: "Unauthorized: Admin access only"
4. Cannot access dashboard
5. If you somehow bypass: redirects to /
```

### ⏰ Test Token Expiration
```
1. Login as admin
2. Wait for token to expire OR manually expire it
3. Try to navigate admin pages
4. Should redirect to /admin/login
5. localStorage should be cleared
```

## Key Implementation Details

### Admin Login Validation
```typescript
// In /admin/login/page.tsx
if (!user.roles.includes("ADMIN")) {
  setError("Unauthorized: Admin access only");
  return; // Don't store tokens, show error
}
```

### Layout Protection
```typescript
// In /admin/layout.tsx
if (!token) redirect("/admin/login");
if (!user.roles.includes("ADMIN")) redirect("/");
// Backend call for final verification
```

### Component Wrapper
```typescript
// AdminDashboardLayout wraps all admin pages
<ProtectAdminRoute>
  {/* Dashboard content */}
</ProtectAdminRoute>
```

## Logout Flow

```
User clicks "Logout" in sidebar
         ↓
handleLogout() called
         ↓
useAdminLogout().logout()
         ↓
1. Clear localStorage:
   - accessToken ❌
   - refreshToken ❌
   - user ❌
         ↓
2. Redirect to /admin/login
         ↓
Login page visible
```

## Common Scenarios

### Scenario 1: Fresh Admin Login
```
Session: None
URL: /admin/login

Action: Enter credentials & submit
Result: 
- Tokens stored
- Redirect to /admin/dashboard
- Dashboard loads successfully
```

### Scenario 2: Admin Closes & Reopens App
```
Session: Tokens stored in localStorage
URL: /admin/dashboard (direct visit)

Check:
- Token exists ✓
- ADMIN role exists ✓
- Backend verification ✓

Result: Dashboard loads immediately
```

### Scenario 3: Regular User Tries Admin Access
```
Session: User logged in (not admin)
URL: /admin/dashboard

Check:
- Login successful ✓
- ADMIN role check ✗

Result: Redirected to / (home page)
```

### Scenario 4: Non-Logged User
```
Session: No login
URL: /admin/dashboard

Check:
- Token exists ✗

Result: Redirected to /admin/login
```

## Environment Setup

### Required Backend
Your backend must support:
1. `/auth/login` - Returns user with roles
2. `/auth/me` - Returns current user
3. User roles should include "ADMIN"

### User Object Requirements
```typescript
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  roles: ["ADMIN"],    // Must contain "ADMIN"
  status: "ACTIVE"
}
```

## URL Reference

| URL | Protection | Access |
|-----|-----------|--------|
| `/admin/login` | None (public) | Everyone |
| `/admin/dashboard` | Layout + Component | Admin only |
| `/admin/dashboard/* ` | Layout + Component | Admin only |
| `/` | None | Everyone |
| `/login` | None | Everyone |

## Implementation Status

✅ Admin login page created
✅ Route protection added
✅ Component-level protection added
✅ Admin hooks created
✅ Logout functionality updated
✅ Documentation created

## Next Steps

1. **Ensure Admin User Exists:**
   - Add admin user to database
   - Set `roles` to `["ADMIN"]`

2. **Test Login:**
   - Visit `/admin/login`
   - Use admin credentials
   - Verify redirect to dashboard

3. **Test Protection:**
   - Try accessing `/admin/dashboard` as non-admin
   - Verify redirect to `/`
   - Try without login
   - Verify redirect to `/admin/login`

4. **Monitor Logs:**
   - Check browser console for any errors
   - Verify API calls to `/auth/login` and `/auth/me`
   - Test token expiration flow

## Troubleshooting Checklist

- [ ] Is user in database with ADMIN role?
- [ ] Does login return user with roles array?
- [ ] Does `/auth/me` include ADMIN in roles?
- [ ] Are tokens being stored in localStorage?
- [ ] Is admin being redirected to correct page?
- [ ] Do non-admins get blocked properly?
- [ ] Does logout clear storage?
- [ ] Do expired tokens redirect to login?

## Support

For issues with admin access:
1. Check ADMIN_AUTH_PROTECTION.md for detailed docs
2. Verify backend user has ADMIN role
3. Check browser console for errors
4. Test `/auth/login` and `/auth/me` APIs directly
5. Clear localStorage and try fresh login
