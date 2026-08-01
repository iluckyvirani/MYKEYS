import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { loginSchema, validateSchema } from "@/lib/auth/validation";
import { verifyPassword } from "@/lib/auth/password";
import { generateTokenPair } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { LoginRequest, LoginResponse } from "@/types/auth";
// import { UserStatus } from "@prisma/client";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING"
}
/**
 * POST /api/auth/login
 * Authenticate user and return access & refresh tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LoginRequest = await request.json();

    // Validate input
    const validation = validateSchema(loginSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const { email, password } = validation.data;

    // Find user by email with roles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw createApiError(ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.password) {
      return errorResponse(
        "This account uses Google Sign-In. Please continue with Google.",
        400,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw createApiError(ErrorCode.INVALID_CREDENTIALS);
    }

    // Check account status
    if (user.status === UserStatus.SUSPENDED) {
      throw createApiError(ErrorCode.ACCOUNT_SUSPENDED);
    }

    if (user.status === UserStatus.INACTIVE) {
      throw createApiError(ErrorCode.ACCOUNT_INACTIVE);
    }

    if (user.status === UserStatus.PENDING) {
      throw createApiError(ErrorCode.ACCOUNT_PENDING);
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Get primary role - select highest privilege role
    // Priority: ADMIN > OWNER > USER
    let primaryRole = "USER";
    if (user.roles && user.roles.length > 0) {
      if (user.roles.some((r) => r.role === "ADMIN")) {
        primaryRole = "ADMIN";
      } else if (user.roles.some((r) => r.role === "OWNER")) {
        primaryRole = "OWNER";
      } else {
        primaryRole = "USER";
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokenPair(
      user.id,
      user.email,
      primaryRole
    );

    // Convert to DTO (exclude password)
    const userDTO = await toUserDTO(user);

    // Prepare response
    const response: LoginResponse = {
      success: true,
      message: "Login successful",
      data: {
        user: userDTO,
        accessToken,
        refreshToken,
      },
    };

    // Create NextResponse with tokens in cookies
    const nextResponse = successResponse(response.data, "Login successful");

    // Set HTTP-only cookies for tokens
    nextResponse.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    nextResponse.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof Error && "statusCode" in error) {
      const apiError = error as any;
      return errorResponse(
        apiError.message,
        apiError.statusCode,
        apiError.code,
        apiError.errors
      );
    }

    return errorResponse(
      "Login failed. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
