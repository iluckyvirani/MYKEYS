import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";
// import { UserRole } from "@prisma/client";
import { errorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";



export const UserRole = {
  USER: "USER",
  OWNER: "OWNER",
  AGENT: "AGENT",
  SERVICE: "SERVICE",
  ADMIN: "ADMIN"
} as const;

/** Roles allowed for seller dashboards (owner + agent APIs). */
export const SELLER_ROLES = [
  UserRole.OWNER,
  UserRole.AGENT,
  UserRole.ADMIN,
] as const;

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
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAccessToken(authHeader.substring(7));
    if (payload) return payload;
    // Expired/invalid Bearer token — fall back to httpOnly cookie
  }

  const cookieToken = request.cookies.get("accessToken")?.value;
  if (cookieToken) {
    return verifyAccessToken(cookieToken);
  }

  return null;
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

async function userHasAnyRole(
  userId: string,
  allowedRoles: string[]
): Promise<boolean> {
  const assignment = await prisma.userRoleAssignment.findFirst({
    where: {
      userId,
      role: { in: allowedRoles as ("USER" | "OWNER" | "AGENT" | "SERVICE" | "ADMIN")[] },
    },
    select: { id: true },
  });
  return assignment !== null;
}

/**
 * Require specific role(s) — checks JWT role and database role assignments
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<JWTPayload> {
  const user = await requireAuth(request);

  if (allowedRoles.includes(user.role)) {
    return user;
  }

  if (await userHasAnyRole(user.userId, allowedRoles)) {
    return user;
  }

  throw new Error("FORBIDDEN");
}

/**
 * Check if user is admin
 */
export async function requireAdmin(request: NextRequest): Promise<JWTPayload> {
  return requireRole(request, [UserRole.ADMIN]);
}

/**
 * Check if user is owner, agent, or admin (seller panel APIs)
 */
export async function requireSellerOrAdmin(
  request: NextRequest
): Promise<JWTPayload> {
  return requireRole(request, [...SELLER_ROLES]);
}

/**
 * @deprecated Use requireSellerOrAdmin
 */
export async function requireOwnerOrAdmin(
  request: NextRequest
): Promise<JWTPayload> {
  return requireSellerOrAdmin(request);
}

/**
 * Higher-order function for protected route handlers
 */
export function withAuth<TParams extends Record<string, string> = Record<string, string>>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    context?: { params: TParams }
  ) => Promise<NextResponse>,
  options?: { roles?: UserRole[] }
) {
  return async (request: NextRequest, context?: { params: Promise<TParams> }) => {
    let user: JWTPayload;

    try {
      if (options?.roles) {
        user = await requireRole(request, options.roles);
      } else {
        user = await requireAuth(request);
      }
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
      console.error("Auth middleware error:", error);
      return errorResponse("Authentication failed", 401);
    }

    let resolvedContext: { params: TParams } | undefined;
    if (context?.params) {
      resolvedContext = { params: await context.params };
    }

    try {
      return await handler(request, user, resolvedContext);
    } catch (error) {
      console.error("API handler error:", error);
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return errorResponse(message, 500);
    }
  };
}
