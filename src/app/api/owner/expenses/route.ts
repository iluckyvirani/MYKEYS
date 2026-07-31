import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { expenseManagementService } from "@/lib/expenses/expenseManagementService";

/**
 * GET /api/owner/expenses?propertyId=&month=YYYY-MM
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId") || undefined;
    const month = searchParams.get("month") || undefined;

    const filters = { propertyId, month };

    const [expenses, stats, properties] = await Promise.all([
      expenseManagementService.listExpenses(user.userId, filters),
      expenseManagementService.getStats(user.userId, filters),
      expenseManagementService.listOwnerProperties(user.userId),
    ]);

    return successResponse(
      { expenses, stats, properties },
      "Expenses retrieved"
    );
  } catch (error: any) {
    console.error("Owner expenses GET error:", error);
    return errorResponse(
      error.message || "Failed to load expenses",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}, { roles: ["OWNER" as any, "ADMIN" as any] });

/**
 * POST /api/owner/expenses
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();
    const expense = await expenseManagementService.createExpense(user.userId, {
      propertyId: body.propertyId,
      title: body.title,
      description: body.description,
      amount: Number(body.amount),
      expenseDate: body.expenseDate,
    });
    return successResponse(expense, "Expense added", 201);
  } catch (error: any) {
    console.error("Owner expenses POST error:", error);
    const status = error.status || 500;
    return errorResponse(
      error.message || "Failed to add expense",
      status,
      status === 400
        ? ErrorCode.VALIDATION_ERROR
        : status === 404
          ? ErrorCode.RESOURCE_NOT_FOUND
          : ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}, { roles: ["OWNER" as any, "ADMIN" as any] });
