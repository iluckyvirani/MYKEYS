// src/app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';
import { uploadBufferToCloudinary, uploadToCloudinary } from '@/lib/cloudinary';

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

/**
 * POST /api/upload
 * Accepts multipart file (preferred) or base64 JSON for older clients.
 */
export const POST = withAuth(async (request: NextRequest, _user: JWTPayload) => {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const folder = String(form.get("folder") || "mykeys/avatars");

      if (!(file instanceof File)) {
        return errorResponse("File data is required", 400, ErrorCode.VALIDATION_ERROR);
      }
      if (!ALLOWED_MIME.has(file.type)) {
        return errorResponse(
          "Invalid file format. Must be an image or PDF",
          400,
          ErrorCode.INVALID_INPUT
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadBufferToCloudinary(buffer, file.type, folder);
      return successResponse(
        { url: result.url, publicId: result.publicId },
        "File uploaded successfully",
        201
      );
    }

    const body = await request.json();
    const { image, folder = 'mykeys/avatars' } = body;

    if (!image) {
      return errorResponse('File data is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Validate base64 format - accept both images and PDFs
    if (!image.startsWith('data:image/') && !image.startsWith('data:application/pdf')) {
      return errorResponse('Invalid file format. Must be base64 encoded image or PDF', 400, ErrorCode.INVALID_INPUT);
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(image, folder);

    return successResponse(
      {
        url: result.url,
        publicId: result.publicId,
      },
      'File uploaded successfully',
      201
    );
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return errorResponse(
      error.message || 'Failed to upload file',
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
