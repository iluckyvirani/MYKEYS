import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { registerSchema, validateSchema } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import { generateTokenPair } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { RegisterRequest, RegisterResponse } from "@/types/auth";
import { notificationService } from "@/lib/notifications/notificationService";
import { emailService } from "@/lib/email/emailService";

/**
 * POST /api/auth/register
 * Register a new user or property owner
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RegisterRequest = await request.json();

    // Validate input
    const validation = validateSchema(registerSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const validatedData = validation.data;

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUserByEmail) {
      throw createApiError(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    // Check if phone already exists (if provided)
    if (validatedData.phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: validatedData.phone },
      });

      if (existingUserByPhone) {
        throw createApiError(ErrorCode.PHONE_ALREADY_EXISTS);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        status: "ACTIVE",
        companyName: validatedData.companyName || null,
        website: validatedData.website || null,
        lastLoginAt: new Date(),
      },
    });

    // Assign USER role by default
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        role: "USER",
      },
    });

    // Send welcome notification
    await notificationService.createSystemNotification(
      user.id,
      "Welcome to MyKeys!",
      `Welcome ${user.firstName}! We're excited to have you on MyKeys. Explore properties, create bookings, and connect with property owners.`
    );

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName);

    // Generate tokens (use USER as primary role)
    const { accessToken, refreshToken } = await generateTokenPair(
      user.id,
      user.email,
      "USER"
    );

    // Convert to DTO (exclude password)
    const userDTO = await toUserDTO(user);

    // Prepare response
    const response: RegisterResponse = {
      success: true,
      message: "Registration successful",
      data: {
        user: userDTO,
        accessToken,
        refreshToken,
      },
    };

    // Create NextResponse with tokens in cookies
    const nextResponse = successResponse(
      response.data,
      "Registration successful",
      201
    );

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
    console.error("Registration error:", error);

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
      "Registration failed. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
