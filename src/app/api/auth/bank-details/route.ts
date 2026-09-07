import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import {
  digitsOnly,
  EMPTY_UK_BANK_DETAILS,
  normalizeUkBankDetails,
  validateUkBankDetails,
} from "@/lib/bank/ukBankDetails";

type BankRow = {
  bankAccountHolder: string | null;
  bankSortCode: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
};

/**
 * GET /api/auth/bank-details
 * UK bank details for the signed-in user (any role).
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    try {
      const rows = await prisma.$queryRaw<BankRow[]>`
        SELECT "bankAccountHolder", "bankSortCode", "bankAccountNumber", "bankName"
        FROM "User"
        WHERE id = ${authUser.userId}
      `;
      return successResponse(
        normalizeUkBankDetails(rows[0] ?? EMPTY_UK_BANK_DETAILS),
        "Bank details retrieved"
      );
    } catch {
      return successResponse(EMPTY_UK_BANK_DETAILS, "Bank details retrieved");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized. Please login.", 401);
    }
    return errorResponse(
      "Failed to load bank details.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PUT /api/auth/bank-details
 * Save required UK bank details (sort code + 8-digit account number).
 */
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();
    const details = normalizeUkBankDetails(body);
    const invalid = validateUkBankDetails(details);
    if (invalid) {
      return errorResponse(invalid, 400, ErrorCode.VALIDATION_ERROR);
    }

    const payload = {
      bankAccountHolder: details.bankAccountHolder,
      bankSortCode: digitsOnly(details.bankSortCode),
      bankAccountNumber: details.bankAccountNumber,
      bankName: details.bankName || null,
    };

    try {
      await prisma.$executeRaw`
        UPDATE "User"
        SET
          "bankAccountHolder" = ${payload.bankAccountHolder},
          "bankSortCode" = ${payload.bankSortCode},
          "bankAccountNumber" = ${payload.bankAccountNumber},
          "bankName" = ${payload.bankName}
        WHERE id = ${authUser.userId}
      `;
    } catch {
      return errorResponse(
        "Bank details could not be saved. Ask an admin to apply the latest database migration.",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return successResponse(
      normalizeUkBankDetails(payload),
      "Bank details saved"
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized. Please login.", 401);
    }
    return errorResponse(
      "Failed to save bank details.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
