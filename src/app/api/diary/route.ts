import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { diaryService } from "@/lib/diary/diaryService";

/**
 * GET /api/diary?status=
 * List diary items for the authenticated user (any role).
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const status = new URL(request.url).searchParams.get("status") || undefined;
    const tasks = await diaryService.list(user.userId, { status });
    return successResponse({ tasks }, "Diary retrieved");
  } catch (error: any) {
    console.error("Diary GET error:", error);
    const status = error.status || 500;
    return errorResponse(
      error.message || "Failed to load diary",
      status,
      status === 400 ? ErrorCode.VALIDATION_ERROR : ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * POST /api/diary
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();
    const task = await diaryService.create(user.userId, {
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status,
      dueDate: body.dueDate,
    });
    return successResponse(task, "Diary item added", 201);
  } catch (error: any) {
    console.error("Diary POST error:", error);
    const status = error.status || 500;
    return errorResponse(
      error.message || "Failed to add diary item",
      status,
      status === 400 ? ErrorCode.VALIDATION_ERROR : ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
