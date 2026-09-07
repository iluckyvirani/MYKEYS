import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { JWTPayload } from "@/lib/auth/jwt";
import { ErrorCode } from "@/lib/auth/errors";
import { createSignedUploadParams } from "@/lib/cloudinary";

/**
 * GET /api/upload/signature?folder=mykeys/service-documents
 * Short-lived Cloudinary signature so the browser can upload directly.
 */
export const GET = withAuth(async (request: NextRequest, _user: JWTPayload) => {
  try {
    const folder =
      new URL(request.url).searchParams.get("folder") || "mykeys/uploads";

    if (!folder.startsWith("mykeys/")) {
      return errorResponse("Invalid upload folder", 400, ErrorCode.INVALID_INPUT);
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return errorResponse(
        "Upload is not configured",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return successResponse(
      createSignedUploadParams(folder),
      "Upload signature created"
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sign upload";
    return errorResponse(message, 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});
