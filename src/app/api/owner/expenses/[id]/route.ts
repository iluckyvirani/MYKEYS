import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { expenseManagementService } from "@/lib/expenses/expenseManagementService";

/**
 * PATCH /api/owner/expenses/[id]
 */
export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const body = await request.json();
      const expense = await expenseManagementService.updateExpense(
        user.userId,
        id,
        {
          propertyId: body.propertyId,
          title: body.title,
          description: body.description,
          amount: body.amount != null ? Number(body.amount) : undefined,
          expenseDate: body.expenseDate,
        }
      );
      return successResponse(expense, "Expense updated");
    } catch (error: any) {
      console.error("Owner expenses PATCH error:", error);
      const status = error.status || 500;
      return errorResponse(
        error.message || "Failed to update expense",
        status,
        status === 400
          ? ErrorCode.VALIDATION_ERROR
          : status === 404
            ? ErrorCode.RESOURCE_NOT_FOUND
            : ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER", "AGENT", "ADMIN"] }
);

/**
 * DELETE /api/owner/expenses/[id]
 */
export const DELETE = withAuth<{ id: string }>(
  async (_request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const result = await expenseManagementService.deleteExpense(
        user.userId,
        id
      );
      return successResponse(result, "Expense deleted");
    } catch (error: any) {
      console.error("Owner expenses DELETE error:", error);
      const status = error.status || 500;
      return errorResponse(
        error.message || "Failed to delete expense",
        status,
        status === 404
          ? ErrorCode.RESOURCE_NOT_FOUND
          : ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER", "AGENT", "ADMIN"] }
);
