# Authentication API Documentation

This document provides comprehensive documentation for all authentication endpoints in the MYKEYS Property Platform.

## Table of Contents
- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Environment Variables](#environment-variables)

---

## Overview

The authentication system uses **JWT (JSON Web Tokens)** with separate access and refresh tokens for secure, stateless authentication.

### Key Features
- ✅ Secure password hashing with bcrypt (12 rounds)
- ✅ JWT-based authentication (access + refresh tokens)
- ✅ HTTP-only cookies for enhanced security
- ✅ Comprehensive input validation with Zod
- ✅ Role-based access control (USER, OWNER, ADMIN)
- ✅ Account status management (ACTIVE, INACTIVE, SUSPENDED, PENDING)
- ✅ Standardized error responses
- ✅ Production-ready architecture

---

## Authentication Flow

```
1. User Registration → Receive access & refresh tokens
2. User Login → Receive access & refresh tokens
3. Access protected routes → Include access token in Authorization header
4. Token expires → Use refresh token to get new access token
5. User Logout → Clear tokens from cookies
```

### Token Lifetimes
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## API Endpoints

### Base URL
```
Development: http://localhost:3000/api/auth
Production: https://your-domain.com/api/auth
```

---

## 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account (USER or OWNER role)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",  // Optional, Indian format
  "role": "USER",  // Optional: "USER" or "OWNER", default: "USER"
  "companyName": "Company Name",  // Optional, for OWNER role
  "website": "https://company.com"  // Optional, for OWNER role
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "cuid_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "9876543210",
      "avatar": null,
      "role": "USER",
      "status": "ACTIVE",
      "companyName": null,
      "taxId": null,
      "bio": null,
      "website": null,
      "createdAt": "2026-01-23T10:30:00.000Z",
      "updatedAt": "2026-01-23T10:30:00.000Z",
      "lastLoginAt": "2026-01-23T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `409` - Email or phone already exists
- `500` - Internal server error

---

## 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive tokens

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "status": "ACTIVE",
      // ... other user fields
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account suspended/inactive/pending
- `500` - Internal server error

---

## 3. Logout User

**Endpoint:** `POST /api/auth/logout`

**Description:** Clear authentication cookies

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Get new access token using refresh token

**Request Body (Optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```
*Note: If not provided in body, will check cookies*

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token
- `500` - Internal server error

---

## 5. Get Current User

**Endpoint:** `GET /api/auth/me`

**Description:** Get authenticated user's profile

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "cuid_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210",
    "avatar": "https://...",
    "role": "USER",
    "status": "ACTIVE",
    "companyName": null,
    "taxId": null,
    "bio": "About me...",
    "website": "https://...",
    "createdAt": "2026-01-23T10:30:00.000Z",
    "updatedAt": "2026-01-23T10:30:00.000Z",
    "lastLoginAt": "2026-01-23T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

## 6. Update Profile

**Endpoint:** `PATCH /api/auth/profile`

**Description:** Update authenticated user's profile

**Authentication:** Required

**Request Body (all fields optional):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "This is my bio",
  "website": "https://mywebsite.com",
  "companyName": "My Company",  // For OWNER role
  "taxId": "TAX123456"  // For OWNER role
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user object
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Unauthorized
- `409` - Phone number already exists
- `500` - Internal server error

---

## 7. Change Password

**Endpoint:** `POST /api/auth/change-password`

**Description:** Change password for authenticated user

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Validation failed / Passwords don't match / Same as current
- `401` - Unauthorized / Incorrect current password
- `500` - Internal server error

---

## 8. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request password reset token (sent via email)

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, we've sent password reset instructions.",
  "data": {
    "resetToken": "abc123..."  // Only in development mode
  }
}
```

**Note:** 
- Always returns success to prevent email enumeration
- In production, sends email with reset link
- Requires schema update to add `resetToken` and `resetTokenExpiry` fields

---

## 9. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password using token from email

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password.",
  "data": null
}
```

**Error Responses:**
- `400` - Invalid or expired token
- `500` - Internal server error

**Note:** Requires schema update to add `resetToken` and `resetTokenExpiry` fields to User model

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "code": "ERROR_CODE",
  "errors": {  // Optional, for validation errors
    "email": ["Invalid email format"],
    "password": ["Password too weak"]
  }
}
```

### Error Codes
| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | No permission |
| `TOKEN_EXPIRED` | 401 | Session expired |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `EMAIL_ALREADY_EXISTS` | 409 | Email in use |
| `PHONE_ALREADY_EXISTS` | 409 | Phone in use |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Security Features

### 1. Password Security
- Bcrypt hashing with 12 salt rounds
- Strong password requirements enforced
- Password strength validation

### 2. Token Security
- JWT with HS256 algorithm
- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite=strict (prevents CSRF)
- Short-lived access tokens (15 min)
- Long-lived refresh tokens (7 days)

### 3. Account Security
- Account status checks (ACTIVE, SUSPENDED, etc.)
- Failed login attempt logging
- Email enumeration prevention
- Password history (prevent reuse)

### 4. API Security
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- Rate limiting (to be implemented)
- CORS configuration

---

## Environment Variables

Add these to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mykeys"

# JWT Secrets (Change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"  # or "production"

# Email Configuration (for password reset)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
```

---

## Authentication Middleware Usage

### Protect Routes

```typescript
import { withAuth, requireOwnerOrAdmin } from "@/lib/auth/middleware";
import { UserRole } from "@prisma/client";

// Any authenticated user
export const GET = withAuth(async (request, user) => {
  // user is guaranteed to exist here
  return Response.json({ user });
});

// Specific roles only
export const POST = withAuth(
  async (request, user) => {
    // Only OWNER or ADMIN can access
    return Response.json({ data: "protected data" });
  },
  { roles: [UserRole.OWNER, UserRole.ADMIN] }
);
```

---

## Client-Side Integration Example

### Using Fetch API

```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // Important for cookies
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens (optional, cookies are set automatically)
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.user;
  }
  
  throw new Error(data.message);
};

// Authenticated Request
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });
  
  return response.json();
};

// Handle Token Refresh
const refreshAccessToken = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Send refresh token cookie
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.accessToken;
  }
  
  // Refresh failed, logout user
  window.location.href = '/login';
};
```

---

## Schema Updates Needed

To enable **forgot/reset password** functionality, add these fields to the User model:

```prisma
model User {
  // ... existing fields
  
  // Password Reset
  resetToken       String?
  resetTokenExpiry DateTime?
}
```

Then run:
```bash
npx prisma migrate dev --name add_password_reset_fields
```

---

## Testing the APIs

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "role": "USER"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Get Profile (replace TOKEN)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Next Steps

1. ✅ Authentication APIs completed
2. ⏳ Install required dependencies (bcryptjs, jose, zod)
3. ⏳ Update Prisma schema for password reset
4. ⏳ Implement email service for password reset
5. ⏳ Add rate limiting middleware
6. ⏳ Create property management APIs
7. ⏳ Create booking APIs
8. ⏳ Create enquiry APIs

---

## Dependencies Required

Add these to your project:

```bash
npm install bcryptjs jose zod
npm install -D @types/bcryptjs
```

---

**Documentation Version:** 1.0.0  
**Last Updated:** January 23, 2026  
**Author:** MYKEYS Development Team
