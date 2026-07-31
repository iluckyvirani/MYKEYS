import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { diaryService } from "@/lib/diary/diaryService";

/**
 * PATCH /api/diary/[id]
 */
export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const body = await request.json();
      const task = await diaryService.update(user.userId, id, {
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        dueDate: body.dueDate,
      });
      return successResponse(task, "Diary item updated");
    } catch (error: any) {
      console.error("Diary PATCH error:", error);
      const status = error.status || 500;
      return errorResponse(
        error.message || "Failed to update diary item",
        status,
        status === 400
          ? ErrorCode.VALIDATION_ERROR
          : status === 404
            ? ErrorCode.RESOURCE_NOT_FOUND
            : ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
);

/**
 * DELETE /api/diary/[id]
 */
export const DELETE = withAuth<{ id: string }>(
  async (_request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const result = await diaryService.remove(user.userId, id);
      return successResponse(result, "Diary item deleted");
    } catch (error: any) {
      console.error("Diary DELETE error:", error);
      const status = error.status || 500;
      return errorResponse(
        error.message || "Failed to delete diary item",
        status,
        status === 404
          ? ErrorCode.RESOURCE_NOT_FOUND
          : ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
);
