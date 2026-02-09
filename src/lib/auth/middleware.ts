import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";
// import { UserRole } from "@prisma/client";
import { errorResponse } from "@/lib/response";



export const UserRole = {
  USER: "USER",
  OWNER: "OWNER",
  ADMIN: "ADMIN"
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
/**
 * Extended NextRequest with user info
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookies as fallback
  const token = request.cookies.get("accessToken")?.value;
  return token || null;
}

/**
 * Middleware to verify authentication
 * Returns user payload if authenticated, null otherwise
 */
export async function authenticate(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  const payload = await verifyAccessToken(token);
  return payload;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const user = await authenticate(request);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<JWTPayload> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

/**
 * Check if user is admin
 */
export async function requireAdmin(request: NextRequest): Promise<JWTPayload> {
  return requireRole(request, [UserRole.ADMIN]);
}

/**
 * Check if user is owner or admin
 */
export async function requireOwnerOrAdmin(
  request: NextRequest
): Promise<JWTPayload> {
  return requireRole(request, [UserRole.OWNER, UserRole.ADMIN]);
}

/**
 * Higher-order function for protected route handlers
 */
export function withAuth<T = any>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    context?: T
  ) => Promise<NextResponse>,
  options?: { roles?: UserRole[] }
) {
  return async (request: NextRequest, context?: T) => {
    try {
      let user: JWTPayload;

      if (options?.roles) {
        user = await requireRole(request, options.roles);
      } else {
        user = await requireAuth(request);
      }

      // Handle Promise-based params for Next.js 15+
      if (context && typeof context === 'object' && 'params' in context) {
        const ctxAny = context as any;
        if (ctxAny.params && typeof ctxAny.params.then === 'function') {
          ctxAny.params = await ctxAny.params;
        }
      }

      return await handler(request, user, context);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          return errorResponse("Unauthorized. Please login.", 401);
        }
        if (error.message === "FORBIDDEN") {
          return errorResponse(
            "Forbidden. You don't have permission to access this resource.",
            403
          );
        }
      }
      return errorResponse("Authentication failed", 401);
    }
  };
}
